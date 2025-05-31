import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface NetworkGraphProps {
  data: {
    supplier_metrics: Array<{
      supplier_id: string
      total_orders: number
      avg_delay: number
      on_time_delivery_rate: number
      avg_quality_score: number
      total_order_value: number
    }>
  }
}

const getColor = (quality: number) => {
  if (quality > 0.9) return '#10B981' // green
  if (quality > 0.8) return '#F59E0B' // yellow
  return '#EF4444' // red
}

const NetworkGraph = ({ data }: NetworkGraphProps) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data) return

    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight

    d3.select(svgRef.current).selectAll('*').remove()
    d3.select('#network-legend').remove()

    const nodes = data.supplier_metrics.map(supplier => ({
      id: supplier.supplier_id,
      value: supplier.total_order_value,
      quality: supplier.avg_quality_score,
      delay: supplier.avg_delay
    }))

    const links = nodes.flatMap((source, i) =>
      nodes.slice(i + 1).map(target => ({
        source: source.id,
        target: target.id,
        value: Math.min(source.value, target.value) / 1000
      }))
    )

    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-350))
      .force('center', d3.forceCenter(width / 2, height / 2))

    const svg = d3.select(svgRef.current)
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.5)
      .attr('stroke-width', d => Math.sqrt(d.value))

    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', d => Math.max(18, Math.sqrt(d.value) / 60))
      .attr('fill', d => getColor(d.quality))
      .attr('stroke', '#222')
      .attr('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .on('mouseover', function (event, d) {
        d3.select(this).attr('stroke-width', 3)
        if (tooltipRef.current) {
          tooltipRef.current.style.display = 'block'
          tooltipRef.current.style.left = event.pageX + 10 + 'px'
          tooltipRef.current.style.top = event.pageY - 28 + 'px'
          tooltipRef.current.innerHTML = `
            <strong>${d.id}</strong><br/>
            Quality: ${(d.quality * 100).toFixed(1)}%<br/>
            Avg Delay: ${d.delay} days<br/>
            Order Value: $${d.value.toLocaleString()}
          `
        }
      })
      .on('mouseout', function () {
        d3.select(this).attr('stroke-width', 1.5)
        if (tooltipRef.current) tooltipRef.current.style.display = 'none'
      })
      .on('click', function (event, d) {
        // Highlight node and its links
        node.attr('opacity', n => (n.id === d.id || links.some(l => (l.source === d.id && l.target === n.id) || (l.target === d.id && l.source === n.id))) ? 1 : 0.2)
        link.attr('stroke', l => (l.source === d.id || l.target === d.id) ? '#6366F1' : '#999')
          .attr('stroke-opacity', l => (l.source === d.id || l.target === d.id) ? 1 : 0.3)
      })

    const label = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text(d => d.id)
      .attr('font-size', 12)
      .attr('dx', 16)
      .attr('dy', 4)
      .attr('pointer-events', 'none')

    simulation.on('tick', () => {
      link
        .attr('x1', d => ((d.source as any).x))
        .attr('y1', d => ((d.source as any).y))
        .attr('x2', d => ((d.target as any).x))
        .attr('y2', d => ((d.target as any).y))
      node
        .attr('cx', d => (d as any).x)
        .attr('cy', d => (d as any).y)
      label
        .attr('x', d => (d as any).x)
        .attr('y', d => (d as any).y)
    })

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      event.subject.fx = event.subject.x
      event.subject.fy = event.subject.y
    }
    function dragged(event: any) {
      event.subject.fx = event.x
      event.subject.fy = event.y
    }
    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0)
      event.subject.fx = null
      event.subject.fy = null
    }
    node.call(d3.drag<any, any>()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended))

    // Add legend
    const legend = d3.select(svgRef.current.parentElement)
      .append('div')
      .attr('id', 'network-legend')
      .attr('style', 'position:absolute;top:10px;right:10px;background:white;padding:8px 12px;border-radius:8px;box-shadow:0 2px 8px #0001;font-size:13px;')
      .html(`
        <div><span style="display:inline-block;width:14px;height:14px;background:#10B981;border-radius:50%;margin-right:6px;"></span>Quality > 90%</div>
        <div><span style="display:inline-block;width:14px;height:14px;background:#F59E0B;border-radius:50%;margin-right:6px;"></span>80% < Quality ≤ 90%</div>
        <div><span style="display:inline-block;width:14px;height:14px;background:#EF4444;border-radius:50%;margin-right:6px;"></span>Quality ≤ 80%</div>
        <div style="margin-top:6px;font-size:12px;">Node size = Order Value</div>
      `)

    return () => {
      simulation.stop()
      if (tooltipRef.current) tooltipRef.current.style.display = 'none'
      d3.select('#network-legend').remove()
    }
  }, [data])

  return (
    <div className="h-96 relative">
      <svg ref={svgRef} width="100%" height="100%" />
      <div ref={tooltipRef} style={{ position: 'absolute', pointerEvents: 'none', display: 'none', background: 'white', border: '1px solid #ccc', borderRadius: 6, padding: '8px 12px', fontSize: 13, zIndex: 10, boxShadow: '0 2px 8px #0002' }} />
    </div>
  )
}

export default NetworkGraph 