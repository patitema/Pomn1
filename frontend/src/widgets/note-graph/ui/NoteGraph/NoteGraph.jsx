import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import * as d3 from 'd3';
import { selectAllNotes } from '@entities/note';
import { DraggableNote } from '@features/drag-and-drop-note';
import { EditNoteModal } from '@features/update-note';
import { CreateNoteForm } from '@features/create-note';
import { CreateNoteButton } from '@features/create-note';
import { Loader } from '@shared/ui';
import './NoteGraph.css';

const NoteGraph = () => {
  const svgRef = useRef(null);
  const notes = useSelector(selectAllNotes);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svg.node()?.clientWidth || 800;
    const height = svg.node()?.clientHeight || 600;

    // Очистка предыдущего графа
    svg.selectAll('*').remove();

    if (!notes || notes.length === 0) {
      setLoading(false);
      return;
    }

    // Подготовка данных
    const graphData = notes.map((note) => ({
      id: note.id,
      title: note.title || 'Без названия',
      x: note.x || Math.random() * width,
      y: note.y || Math.random() * height,
    }));

    // Создание симуляции
    const simulation = d3
      .forceSimulation(graphData)
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide(50))
      .on('tick', ticked);

    // Отрисовка узлов
    const nodes = svg
      .append('g')
      .attr('class', 'note-graph__nodes')
      .selectAll('circle')
      .data(graphData)
      .join('circle')
      .attr('r', 25)
      .attr('fill', '#FEB7FF')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .on('click', (event, d) => {
        const note = notes.find((n) => n.id === d.id);
        if (note) setEditingNote(note);
      });

    // Подписи к узлам
    svg
      .append('g')
      .attr('class', 'note-graph__labels')
      .selectAll('text')
      .data(graphData)
      .join('text')
      .attr('dx', 30)
      .attr('dy', 5)
      .attr('font-size', '12px')
      .attr('fill', '#fff')
      .text((d) => d.title.slice(0, 20));

    function ticked() {
      nodes.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
      svg.selectAll('.note-graph__labels text')
        .attr('x', (d) => d.x)
        .attr('y', (d) => d.y);
    }

    setLoading(false);

    return () => {
      simulation.stop();
    };
  }, [notes]);

  return (
    <div className="note-graph">
      <div className="note-graph__header">
        <h1 className="note-graph__title">Граф заметок</h1>
        <CreateNoteButton onClick={() => setIsCreateModalOpen(true)} />
      </div>
      
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
      
      {/* Модальные окна */}
      <EditNoteModal
        note={editingNote}
        isOpen={!!editingNote}
        onClose={() => setEditingNote(null)}
      />
      
      <CreateNoteForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default NoteGraph;
