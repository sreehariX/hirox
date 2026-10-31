"use client";
import { ReactFlow,Background,Controls,Handle,Position,type Node,type NodeProps } from "@xyflow/react";
import { Building2,UserRound,Code2,Radio } from "lucide-react";
import "@xyflow/react/dist/style.css";
import type { Prospect } from "@/lib/types";
type EntityData={label:string;kind:string;detail:string;central?:boolean;sourceIds:string[]};
type Entity=Node<EntityData,"entity">;
function EntityNode({data}:NodeProps<Entity>){const Icon=data.kind==="person"?UserRound:data.kind==="project"?Code2:data.kind==="signal"?Radio:Building2;return <div className={`graph-entity ${data.central?"central":""}`}><Handle type="target" position={Position.Left}/><div className="graph-icon"><Icon size={16}/></div><div><strong>{data.label}</strong><span>{data.central?"Research subject":data.kind}</span></div><Handle type="source" position={Position.Right}/></div>;}
const types={entity:EntityNode};
export default function EvidenceGraph({prospect,onSource}:{prospect:Prospect;onSource:(id:string)=>void}) {
  const connections=prospect.connections.slice(0,7);
  const nodes:Entity[]=[{id:"subject",type:"entity",position:{x:320,y:180},data:{label:prospect.name,kind:prospect.kind,detail:prospect.headline,central:true,sourceIds:[]}},...connections.map((c,i)=>({id:`node-${i}`,type:"entity" as const,position:{x:i%2?640:0,y:Math.floor(i/2)*135},data:{label:c.name,kind:c.kind,detail:c.text,sourceIds:c.sourceIds}}))];
  const edges=connections.map((c,i)=>({id:`edge-${i}`,source:i%2?"subject":`node-${i}`,target:i%2?`node-${i}`:"subject",type:"smoothstep",style:{stroke:"#9ac3b6",strokeWidth:1.5},label:"evidence",labelStyle:{fontSize:10,fill:"#6c817b"}}));
  return <div className="graph-canvas"><ReactFlow nodes={nodes} edges={edges} nodeTypes={types} fitView fitViewOptions={{padding:.22}} nodesDraggable={false} nodesConnectable={false} onNodeClick={(_,node)=>node.data.sourceIds[0]&&onSource(node.data.sourceIds[0])} minZoom={.35} maxZoom={1.5} proOptions={{hideAttribution:true}}><Background gap={20} color="#dae4df"/><Controls showInteractive={false}/></ReactFlow><div className="graph-caption">Click a connection to inspect its source.</div></div>;
}
