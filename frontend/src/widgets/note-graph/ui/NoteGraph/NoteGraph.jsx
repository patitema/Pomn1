import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useGetNotesQuery, useGetLinksQuery } from '@shared/api';
import { EditNoteModal } from '@features/update-note';
import { Loader } from '@shared/ui';
import './NoteGraph.css';

const NoteGraph = ({ selectedNoteId, onNoteSelect }) => {
  const svgRef = useRef(null);

  // Загрузка данных через RTK Query
  const { data: allNotes = [], isLoading: notesLoading } = useGetNotesQuery();
  const { data: links = [], isLoading: linksLoading } = useGetLinksQuery();

  // Показываем все заметки включая папки
  const notes = allNotes;

  const [editingNote, setEditingNote] = useState(null);
  const simulationRef = useRef(null);
  const nodesRef = useRef(null);

  // Вычисляем loading на основе состояния загрузки
  const loading = notesLoading || linksLoading;

  // Эффект для создания графа (только при изменении данных)
  useEffect(() => {
    console.log('NoteGraph useEffect - creating graph:', {
      notesLoading,
      linksLoading,
      notesCount: notes.length,
      linksCount: links.length,
      loading
    });

    if (!svgRef.current) return;
    if (loading) return;
    if (!notes || notes.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = svg.node()?.clientWidth || 800;
    const height = svg.node()?.clientHeight || 600;

    // Устанавливаем фиксированный viewBox
    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    // Очистка предыдущего графа
    svg.selectAll('*').remove();

    // Подготовка данных для D3
    const graphData = {
      nodes: notes.map((note) => ({
        id: note.id,
        title: note.title || 'Без названия',
        group: note.folder || 0,
        // Инициализируем позиции в центре
        x: width / 2 + (Math.random() - 0.5) * 100,
        y: height / 2 + (Math.random() - 0.5) * 100,
      })),
      links: links.map((link) => ({
        source: link.note_from,
        target: link.note_to,
        id: link.id,
      })),
    };

    // Создание симуляции с кастомной силой отталкивания
    const simulation = d3
      .forceSimulation(graphData.nodes)
      .force('link', d3.forceLink(graphData.links).id((d) => d.id).distance(120))
      .force('charge', d3.forceManyBody()
        .strength((d) => {
          // Считаем количество связей для узла
          const linkCount = graphData.links.filter(l =>
            l.source.id === d.id || l.target.id === d.id
          ).length;
          // Чем больше связей, тем сильнее отталкивание
          return -300 - (linkCount * 100);
        })
      )
      .force('collide', d3.forceCollide(35).strength(0.8))
      .force('x', d3.forceX(width / 2).strength(0.02))
      .force('y', d3.forceY(height / 2).strength(0.02))
      .alphaDecay(0.02) // Медленнее затухание для плавной анимации
      .on('tick', ticked);

    // Отрисовка связей (Links)
    const link = svg
      .append('g')
      .attr('class', 'note-graph__links')
      .selectAll('line')
      .data(graphData.links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2);

    // Отрисовка узлов
    const node = svg
      .append('g')
      .attr('class', 'note-graph__nodes')
      .selectAll('circle')
      .data(graphData.nodes)
      .join('circle')
      .attr('r', 15)
      .attr('fill', (d) => {
        const noteData = notes.find(n => n.id === d.id);
        return noteData?.is_folder ? '#4CAF50' : '#FEB7FF';
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        const note = notes.find((n) => n.id === d.id);
        if (note && onNoteSelect) {
          onNoteSelect(note);
        }
      })
      .on('dblclick', (event, d) => {
        const note = notes.find((n) => n.id === d.id);
        if (note) setEditingNote(note);
      })
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
      );

    // Сохраняем ссылку на узлы для обновления
    nodesRef.current = node;

    // Подписи к узлам
    const labels = svg
      .append('g')
      .attr('class', 'note-graph__labels')
      .selectAll('text')
      .data(graphData.nodes)
      .join('text')
      .attr('dx', 30)
      .attr('dy', 5)
      .attr('font-size', '12px')
      .attr('fill', '#fff')
      .style('pointer-events', 'none')
      .text((d) => d.title.slice(0, 20));

    // Функции для drag-and-drop
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    function ticked() {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      node
        .attr('cx', (d) => {
          // Ограничение по X (с отступом 30px от краёв)
          d.x = Math.max(30, Math.min(width - 30, d.x));
          return d.x;
        })
        .attr('cy', (d) => {
          // Ограничение по Y (с отступом 30px от краёв)
          d.y = Math.max(30, Math.min(height - 30, d.y));
          return d.y;
        });

      labels.attr('x', (d) => d.x).attr('y', (d) => d.y);
    }

    return () => {
      simulation.stop();
    };
  }, [notes, links, loading]);

  // Отдельный эффект для обновления выбранного узла (без перерисовки)
  useEffect(() => {
    if (!nodesRef.current) return;

    console.log('Updating selected node:', selectedNoteId);

    nodesRef.current
      .attr('r', (d) => d.id === selectedNoteId ? 22 : 15)
      .attr('stroke', (d) => d.id === selectedNoteId ? '#FFD700' : '#fff')
      .attr('stroke-width', (d) => d.id === selectedNoteId ? 4 : 2);
  }, [selectedNoteId]);

  return (
    <div className="note-graph">
      <div className="note-graph__container">
        {loading ? (
          <div className="note-graph__loading">
            <Loader size="large" />
            <p>Загрузка графа...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="note-graph__empty">
            <h2>Нет заметок</h2>
            <p>Создайте первую заметку!</p>
          </div>
        ) : (
          <svg ref={svgRef} className="note-graph__svg">
            {/* Граф отрисовывается через D3 */}
          </svg>
        )}
      </div>

      {/* Модальное окно редактирования */}
      <EditNoteModal
        note={editingNote}
        isOpen={!!editingNote}
        onClose={() => setEditingNote(null)}
      />
    </div>
  );
};

export default NoteGraph;
