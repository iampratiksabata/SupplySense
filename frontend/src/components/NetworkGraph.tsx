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

const NetworkGraph = ({ data }: NetworkGraphProps) => {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data) return

    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight

    // Clear previous graph
    d3.select(svgRef.current).selectAll('*').remove()

    // Create nodes from supplier data
    const nodes = data.supplier_metrics.map(supplier => ({
      id: supplier.supplier_id,
      value: supplier.total_order_value,
      quality: supplier.avg_quality_score,
      delay: supplier.avg_delay
    }))

    // Create links between nodes
    const links = nodes.flatMap((source, i) =>
      nodes.slice(i + 1).map(target => ({
        source: source.id,
        target: target.id,
        value: Math.min(source.value, target.value) / 1000
      }))
    )

    // Create simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))

    // Create SVG elements
    const svg = d3.select(svgRef.current)
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => Math.sqrt(d.value))

    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', d => Math.sqrt(d.value) / 100)
      .attr('fill', d => d.quality > 0.9 ? '#10B981' : d.quality > 0.8 ? '#F59E0B' : '#EF4444')
      .call(d3.drag<any, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))

    const label = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text(d => d.id)
      .attr('font-size', 10)
      .attr('dx', 12)
      .attr('dy', 4)

    // Update positions on each tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as any).x)
        .attr('y1', d => (d.source as any).y)
        .attr('x2', d => (d.target as any).x)
        .attr('y2', d => (d.target as any).y)

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)

      label
        .attr('x', d => d.x)
        .attr('y', d => d.y)
    })

    // Drag functions
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

    return () => {
      simulation.stop()
    }
  }, [data])

  return (
    <div className="h-96">
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  )
}

export default NetworkGraph 