import React, { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'
const DATA_URL = '/graph.json'

const ForceGraphRenderer = () => {
  const svgRef = useRef(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(DATA_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()
      })
      .then((loadedData) => {
        setData(loadedData)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Ошибка при загрузке данных:', error)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (loading || !data || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 928
    const height = 680
    const color = d3.scaleOrdinal(d3.schemeCategory10)

    const links = data.links.map((d) => ({ ...d }))
    const nodes = data.nodes.map((d) => ({ ...d }))

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3.forceLink(links).id((d) => d.id)
      )
      .force('charge', d3.forceManyBody())
      .force('x', d3.forceX())
      .force('y', d3.forceY())

    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [-width / 2, -height / 2, width, height])
      .attr('style', 'max-width: 100%; height: auto;')

    const link = svg
      .append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 1)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', (d) => Math.sqrt(d.value + 10))

    const node = svg
      .append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 7)
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

    return () => simulation.stop()
  }, [data, loading])

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Загрузка данных графа...
      </div>
    )
  }

  if (!data) {
    return (
      <div style={{ color: 'red', padding: '20px', textAlign: 'center' }}>
        Ошибка: Не удалось загрузить данные из {DATA_URL}.
      </div>
    )
  }

  return (
    <div style={{ margin: 'auto', textAlign: 'center' }}>
      <svg ref={svgRef}></svg>
    </div>
  )
}

export default ForceGraphRenderer
