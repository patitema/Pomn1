import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useGetNotesQuery, useGetLinksQuery } from '@shared/api';
import { getLinkEndpoints } from '@entities/link';
import { getNoteTitle, isFolderNote } from '@entities/note';
import { Loader } from '@shared/ui';
import './NoteGraph.css';

const CONNECTION_MODE = {
  IDLE: 'idle',
  PICK_SOURCE: 'pick-source',
  PICK_TARGET: 'pick-target',
};

const GRAPH_PADDING = 30;
const GRAPH_BOTTOM_SAFE_AREA = 130;

const hasExistingConnection = (links, sourceId, targetId) =>
  links.some((link) => {
    const [from, to] = getLinkEndpoints(link);
    return (
      (from === sourceId && to === targetId) ||
      (from === targetId && to === sourceId)
    );
  });

const getPairKey = (sourceId, targetId) => [sourceId, targetId].sort().join(':');

const getNoteFolderPair = (source, target) => {
  const items = [source, target];
  const childNote = items.find((item) => item && !item.is_folder);
  const folderNote = items.find((item) => item?.is_folder);

  return { childNote, folderNote };
};

const isCurrentFolderPair = (source, target) => {
  const { childNote, folderNote } = getNoteFolderPair(source, target);
  return Boolean(childNote && folderNote && childNote.folder === folderNote.id);
};

const isValidConnectionTarget = (source, target, links) =>
  Boolean(
    source &&
      target &&
      source.id !== target.id &&
      !isCurrentFolderPair(source, target) &&
      !hasExistingConnection(links, source.id, target.id)
  );

const NoteGraph = ({
  selectedNoteId,
  connectionMode = CONNECTION_MODE.IDLE,
  connectionSourceId = null,
  onNoteSelect,
  onNoteEdit,
  onConnectionNodeClick,
  onConnectionEdgeClick,
}) => {
  const svgRef = useRef(null);
  const { data: notes = [], isLoading: notesLoading } = useGetNotesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const { data: links = [], isLoading: linksLoading } = useGetLinksQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const nodesRef = useRef(null);
  const nodePositionsRef = useRef(new Map());
  const loading = notesLoading || linksLoading;

  useEffect(() => {
    if (!svgRef.current || loading || notes.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = svg.node()?.clientWidth || 800;
    const height = svg.node()?.clientHeight || 600;
    const isPickingSource = connectionMode === CONNECTION_MODE.PICK_SOURCE;
    const isPickingTarget = connectionMode === CONNECTION_MODE.PICK_TARGET;
    const connectionSource = notes.find((note) => note.id === connectionSourceId);

    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    svg.selectAll('*').remove();

    const hasNewNodes = notes.some((note) => !nodePositionsRef.current.has(note.id));
    const folderEdges = notes
      .filter((note) => note.folder && notes.some((folder) => folder.id === note.folder))
      .map((note) => ({
        source: note.folder,
        target: note.id,
        id: `folder-${note.folder}-${note.id}`,
        type: 'folder',
        folderId: note.folder,
        noteId: note.id,
      }));
    const folderEdgePairs = new Set(
      folderEdges.map((edge) => getPairKey(edge.source, edge.target))
    );
    const semanticEdges = links
      .map((link) => {
        const [source, target] = getLinkEndpoints(link);
        return {
          source,
          target,
          id: `semantic-${link.id}`,
          type: 'semantic',
          linkId: link.id,
        };
      })
      .filter((edge) => !folderEdgePairs.has(getPairKey(edge.source, edge.target)));
    const graphData = {
      nodes: notes.map((note) => {
        const savedPosition = nodePositionsRef.current.get(note.id);

        return {
          id: note.id,
          title: getNoteTitle(note),
          group: note.folder || 0,
          x: savedPosition?.x ?? width / 2 + (Math.random() - 0.5) * 100,
          y: savedPosition?.y ?? height / 2 + (Math.random() - 0.5) * 100,
        };
      }),
      links: [...folderEdges, ...semanticEdges],
    };

    const findNote = (id) => notes.find((note) => note.id === id);
    const canUseAsTarget = (nodeData) =>
      isPickingTarget &&
      isValidConnectionTarget(connectionSource, findNote(nodeData.id), links);

    const simulation = d3
      .forceSimulation(graphData.nodes)
      .force('link', d3.forceLink(graphData.links).id((d) => d.id).distance(120))
      .force(
        'charge',
        d3.forceManyBody().strength((d) => {
          const linkCount = graphData.links.filter(
            (link) => link.source.id === d.id || link.target.id === d.id
          ).length;
          return -300 - linkCount * 100;
        })
      )
      .force('collide', d3.forceCollide(35).strength(0.8))
      .force('x', d3.forceX(width / 2).strength(0.02))
      .force('y', d3.forceY(height / 2).strength(0.02))
      .alpha(hasNewNodes ? 1 : 0.05)
      .alphaDecay(0.02)
      .on('tick', ticked);

    const link = svg
      .append('g')
      .attr('class', 'note-graph__links')
      .selectAll('line')
      .data(graphData.links)
      .join('line')
      .attr('class', (d) => `note-graph__link note-graph__link--${d.type}`)
      .attr('stroke', (d) => (d.type === 'folder' ? '#999' : '#777'))
      .attr('stroke-opacity', (d) => (d.type === 'folder' ? 0.65 : 0.55))
      .attr('stroke-width', (d) => (d.type === 'folder' ? 2 : 1.75))
      .attr('stroke-dasharray', (d) => (d.type === 'semantic' ? '7 7' : null))
      .style('cursor', connectionMode !== CONNECTION_MODE.IDLE ? 'pointer' : 'default')
      .on('mouseenter', function handleEdgeMouseEnter() {
        if (connectionMode === CONNECTION_MODE.IDLE) return;
        d3.select(this)
          .attr('stroke', '#ff4d4d')
          .attr('stroke-opacity', 1)
          .attr('stroke-width', 4);
      })
      .on('mouseleave', function handleEdgeMouseLeave(event, d) {
        d3.select(this)
          .attr('stroke', d.type === 'folder' ? '#999' : '#777')
          .attr('stroke-opacity', d.type === 'folder' ? 0.65 : 0.55)
          .attr('stroke-width', d.type === 'folder' ? 2 : 1.75);
      })
      .on('click', (event, d) => {
        if (connectionMode === CONNECTION_MODE.IDLE) return;
        event.stopPropagation();
        onConnectionEdgeClick?.(d);
      });

    const setEdgeActiveState = (edge, isActive) => {
      svg.selectAll('.note-graph__link')
        .filter((linkData) => linkData.id === edge.id)
        .attr('stroke', isActive ? '#ff4d4d' : edge.type === 'folder' ? '#999' : '#777')
        .attr('stroke-opacity', isActive ? 1 : edge.type === 'folder' ? 0.65 : 0.55)
        .attr('stroke-width', isActive ? 4 : edge.type === 'folder' ? 2 : 1.75);
    };

    const linkHitbox = svg
      .append('g')
      .attr('class', 'note-graph__link-hitboxes')
      .selectAll('line')
      .data(graphData.links)
      .join('line')
      .attr('class', 'note-graph__link-hitbox')
      .attr('stroke', 'transparent')
      .attr('stroke-width', 18)
      .style('cursor', connectionMode !== CONNECTION_MODE.IDLE ? 'pointer' : 'default')
      .style('pointer-events', connectionMode !== CONNECTION_MODE.IDLE ? 'stroke' : 'none')
      .on('mouseenter', (event, d) => {
        if (connectionMode === CONNECTION_MODE.IDLE) return;
        setEdgeActiveState(d, true);
      })
      .on('mouseleave', (event, d) => {
        setEdgeActiveState(d, false);
      })
      .on('click', (event, d) => {
        if (connectionMode === CONNECTION_MODE.IDLE) return;
        event.stopPropagation();
        onConnectionEdgeClick?.(d);
      });

    const tempLine =
      isPickingTarget && connectionSource
        ? svg
            .append('line')
            .attr('class', 'note-graph__connection-line')
            .attr('stroke', '#FEB7FF')
            .attr('stroke-opacity', 0.9)
            .attr('stroke-width', 3)
            .attr('stroke-dasharray', '8 6')
        : null;

    const node = svg
      .append('g')
      .attr('class', 'note-graph__nodes')
      .selectAll('circle')
      .data(graphData.nodes)
      .join('circle')
      .attr('r', 15)
      .attr('fill', (d) => {
        const noteData = findNote(d.id);
        return isFolderNote(noteData) ? '#4CAF50' : '#FEB7FF';
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .classed('note-graph__node--connection-source', (d) => d.id === connectionSourceId)
      .classed('note-graph__node--connection-target', (d) => canUseAsTarget(d))
      .classed(
        'note-graph__node--connection-disabled',
        (d) => isPickingTarget && d.id !== connectionSourceId && !canUseAsTarget(d)
      )
      .style('cursor', (d) => {
        if (isPickingSource) return 'crosshair';
        if (isPickingTarget) return canUseAsTarget(d) ? 'crosshair' : 'not-allowed';
        return 'pointer';
      })
      .on('click', (event, d) => {
        const note = findNote(d.id);
        if (!note) return;

        if (connectionMode !== CONNECTION_MODE.IDLE) {
          event.stopPropagation();
          if (isPickingSource || canUseAsTarget(d)) {
            onConnectionNodeClick?.(note);
          }
          return;
        }

        onNoteSelect?.(note);
      })
      .on('dblclick', (event, d) => {
        if (connectionMode !== CONNECTION_MODE.IDLE) {
          event.stopPropagation();
          return;
        }

        const note = findNote(d.id);
        if (note && onNoteEdit) {
          onNoteEdit(note);
        }
      })
      .call(
        d3
          .drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended)
      );

    nodesRef.current = node;

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

    if (tempLine) {
      svg.on('mousemove.connection-line', (event) => {
        const [x, y] = d3.pointer(event, svg.node());
        tempLine.attr('x2', x).attr('y2', y);
      });
    }

    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = Math.max(
        GRAPH_PADDING,
        Math.min(height - GRAPH_BOTTOM_SAFE_AREA, event.y)
      );
      nodePositionsRef.current.set(event.subject.id, {
        x: event.x,
        y: event.subject.fy,
      });
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

      linkHitbox
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      node
        .attr('cx', (d) => {
          d.x = Math.max(GRAPH_PADDING, Math.min(width - GRAPH_PADDING, d.x));
          nodePositionsRef.current.set(d.id, {
            x: d.x,
            y: Math.max(GRAPH_PADDING, Math.min(height - GRAPH_BOTTOM_SAFE_AREA, d.y)),
          });
          return d.x;
        })
        .attr('cy', (d) => {
          d.y = Math.max(GRAPH_PADDING, Math.min(height - GRAPH_BOTTOM_SAFE_AREA, d.y));
          nodePositionsRef.current.set(d.id, {
            x: d.x,
            y: d.y,
          });
          return d.y;
        });

      labels.attr('x', (d) => d.x).attr('y', (d) => d.y);

      if (tempLine && connectionSource) {
        const sourceNode = graphData.nodes.find((nodeData) => nodeData.id === connectionSource.id);
        if (sourceNode) {
          tempLine
            .attr('x1', sourceNode.x)
            .attr('y1', sourceNode.y)
            .attr('x2', tempLine.attr('x2') || sourceNode.x)
            .attr('y2', tempLine.attr('y2') || sourceNode.y);
        }
      }
    }

    return () => {
      svg.on('mousemove.connection-line', null);
      simulation.stop();
    };
  }, [
    notes,
    links,
    loading,
    connectionMode,
    connectionSourceId,
    onConnectionNodeClick,
    onConnectionEdgeClick,
    onNoteSelect,
    onNoteEdit,
  ]);

  useEffect(() => {
    if (!nodesRef.current) return;

    nodesRef.current
      .attr('r', (d) => (d.id === selectedNoteId ? 22 : 15))
      .attr('stroke', (d) => (d.id === selectedNoteId ? '#FFD700' : '#fff'))
      .attr('stroke-width', (d) => (d.id === selectedNoteId ? 4 : 2));
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
            <p>Создайте первую заметку.</p>
          </div>
        ) : (
          <div className="note-graph__viewport">
            <svg ref={svgRef} className="note-graph__svg" />
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteGraph;
