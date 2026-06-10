import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: "equipment" | "sensor" | "actuator" | "alarm" | "controller";
  status?: "active" | "idle" | "error";
  fx?: number | null;
  fy?: number | null;
}

interface Link {
  source: string;
  target: string;
  type: string;
}

interface D3GraphProps {
  nodes: Node[];
  links: Link[];
  onNodeClick?: (node: Node) => void;
}

export default function D3Graph({ nodes, links, onNodeClick }: D3GraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Color scheme for node types
    const colorMap: Record<string, string> = {
      equipment: "#3b82f6",
      sensor: "#10b981",
      actuator: "#f59e0b",
      alarm: "#ef4444",
      controller: "#8b5cf6",
    };

    // Create simulation
    const simulation = d3
      .forceSimulation<Node>(nodes as any)
      .force(
        "link",
        d3
          .forceLink<Node, Link>(links)
          .id((d) => d.id)
          .distance(100)
          .strength(0.5)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(50));

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

    // Add background
    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent")
      .on("click", () => setSelectedNode(null));

    // Create arrow markers for links
    svg
      .append("defs")
      .selectAll("marker")
      .data(["default"])
      .enter()
      .append("marker")
      .attr("id", (d: any) => `arrow-${d}`)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#94a3b8");

    // Add links
    const link = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "#cbd5e1")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.6)
      .attr("marker-end", "url(#arrow-default)") as any;

    // Add link labels
    const linkLabels = svg
      .append("g")
      .selectAll("text")
      .data(links)
      .enter()
      .append("text")
      .attr("font-size", "10px")
      .attr("fill", "#64748b")
      .attr("text-anchor", "middle")
      .text((d: any) => d.type);

    // Add nodes
    const node = svg
      .append("g")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", 25)
      .attr("fill", (d: any) => colorMap[d.type] || "#6b7280")
      .attr("stroke", (d: any) => (selectedNode?.id === d.id ? "#000" : "white"))
      .attr("stroke-width", (d: any) => (selectedNode?.id === d.id ? 3 : 2))
      .attr("opacity", 0.9)
      .style("cursor", "pointer")
      .on("click", (event: any, d: any) => {
        event.stopPropagation();
        setSelectedNode(d);
        onNodeClick?.(d);
      })
      .on("mouseover", function (this: any) {
        d3.select(this).attr("stroke-width", 3).attr("opacity", 1);
      })
      .on("mouseout", function (this: any, d: any) {
        d3.select(this)
          .attr("stroke-width", selectedNode?.id === d.id ? 3 : 2)
          .attr("opacity", 0.9);
      });

    // Add node labels
    const labels = svg
      .append("g")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .attr("font-size", "11px")
      .attr("font-weight", "bold")
      .attr("fill", "white")
      .attr("pointer-events", "none")
      .text((d: any) => d.label.substring(0, 10));

    // Add drag behavior
    node.call(
      d3
        .drag<SVGCircleElement, Node>()
        .on("start", (event: any, d: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event: any, d: any) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event: any, d: any) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
    );

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => (d.source as any).x)
        .attr("y1", (d: any) => (d.source as any).y)
        .attr("x2", (d: any) => (d.target as any).x)
        .attr("y2", (d: any) => (d.target as any).y);

      linkLabels
        .attr("x", (d: any) => ((d.source as any).x + (d.target as any).x) / 2)
        .attr("y", (d: any) => ((d.source as any).y + (d.target as any).y) / 2);

      node.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);

      labels.attr("x", (d: any) => d.x).attr("y", (d: any) => d.y);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links, selectedNode, onNodeClick]);

  return (
    <div className="w-full h-full flex flex-col">
      <svg
        ref={svgRef}
        className="w-full flex-1 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg"
      />
      {selectedNode && (
        <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">{selectedNode.label}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                Type: {selectedNode.type}
              </p>
              {selectedNode.status && (
                <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                  Status: {selectedNode.status}
                </p>
              )}
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded text-sm hover:bg-slate-300 dark:hover:bg-slate-600"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
