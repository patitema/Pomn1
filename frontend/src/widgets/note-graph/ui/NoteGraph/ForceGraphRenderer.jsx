import React, { useRef, useEffect, useState } from 'react'
import * as d3 from 'd3'

// Укажите правильный путь к вашему JSON-файлу
const DATA_URL = '/graph.json'

const ForceGraphRenderer = () => {
  const svgRef = useRef(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  // ЭФФЕКТ 1: Загрузка данных (Выполняется только при монтировании)
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

  // ЭФФЕКТ 2: Рендеринг D3 и симуляция (Выполняется после загрузки данных)
  useEffect(() => {
    // Выходим, если данные еще не загружены
    if (loading || !data || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove() // Очистка

    // --- НАЧАЛО ВАШЕГО КОДА D3 ---

    // 1. Параметры
    const width = 928
    const height = 680
    const color = d3.scaleOrdinal(d3.schemeCategory10)

    // 2. Копирование данных (ВАЖНО для симуляции)
    const links = data.links.map((d) => ({ ...d }))
    const nodes = data.nodes.map((d) => ({ ...d }))

    // 3. Создание симуляции
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3.forceLink(links).id((d) => d.id)
      )
      .force('charge', d3.forceManyBody())
      .force('x', d3.forceX())
      .force('y', d3.forceY())

    // 4. Настройка SVG
    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [-width / 2, -height / 2, width, height])
      .attr('style', 'max-width: 100%; height: auto;')

    // 5. Создание связей (Links)
    const link = svg
      .append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', (d) => Math.sqrt(d.value))

    // 6. Создание узлов (Nodes)
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

    // 7. Функции для перетаскивания
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

    // 8. Добавление поведения перетаскивания
    node.call(
      d3
        .drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
    )

    // 9. Обновление позиций на каждом "тике" симуляции
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y)

      node.attr('cx', (d) => d.x).attr('cy', (d) => d.y)
    })

    // 10. Очистка: остановка симуляции при размонтировании компонента
    return () => simulation.stop()
  }, [data, loading]) // Перезапуск D3-логики при изменении данных

  // --- Рендеринг JSX ---
  if (loading) {
    return <div style={{ padding: '20px' }}>Загрузка данных графа...</div>
  }

  if (!data) {
    return (
      <div style={{ color: 'red', padding: '20px' }}>
        Ошибка: Не удалось загрузить данные из {DATA_URL}.
      </div>
    )
  }

  return (
    <div style={{ margin: 'auto', textAlign: 'center' }}>
      {/* Элемент SVG, к которому D3 будет привязываться */}
      <svg ref={svgRef}></svg>
    </div>
  )
}

export default ForceGraphRenderer
