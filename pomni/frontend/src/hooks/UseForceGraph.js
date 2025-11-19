import { useEffect } from 'react'
import * as d3 from 'd3'

// Кастомный хук, который принимает ссылку на SVG-элемент и данные
const useForceGraph = (svgRef, data) => {
  useEffect(() => {
    // Условие выхода, если данных нет или SVG еще не смонтирован
    if (!data || !svgRef.current) return

    // Выбор существующего SVG-элемента
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove() // Очистка

    // --- Логика D3 (Ваш код) ---
    // ... (весь код симуляции сил, который был в предыдущем ответе)
    // ...
    // Включая dragstarted, dragged, dragended и simulation.on("tick", ...)

    const width = 928
    const height = 680
    const color = d3.scaleOrdinal(d3.schemeCategory10)
    const links = data.links.map((d) => ({ ...d }))
    const nodes = data.nodes.map((d) => ({ ...d }))

    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [-width / 2, -height / 2, width, height])
      .attr('style', 'max-width: 100%; height: auto;')

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3.forceLink(links).id((d) => d.id)
      )
      .force('charge', d3.forceManyBody())
      .force('x', d3.forceX())
      .force('y', d3.forceY())

    const link = svg
      .append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', (d) => Math.sqrt(d.value))

    const node = svg
      .append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 5)
      .attr('fill', (d) => color(d.group))

    node.append('title').text((d) => d.id)

    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      event.subject.fx = event.subject.x
      event.subject.fy = event.subject.y
    }

    function dragged(event) {
      event.subject.fx = event.x
      event.subject.fy = event.y
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0)
      event.subject.fx = null
      event.subject.fy = null
    }

    node.call(
      d3
        .drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
    )

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y)

      node.attr('cx', (d) => d.x).attr('cy', (d) => d.y)
    })

    // Очистка
    return () => simulation.stop()
  }, [data]) // Зависимости хука
}

export default useForceGraph
