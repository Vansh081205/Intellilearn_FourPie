import json
import re
from app_modules.models import Quiz
from app_modules.services.gemini_service import GeminiService

def build_graph_structure(concepts, filename, generator_type):
    """Build knowledge graph structure from concepts"""
    colors = ['#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1']
    nodes = [{'id': 'main', 'label': filename.split('.')[0][:30], 'level': 0, 'color': '#3B82F6', 'size': 50}]
    links = []

    for idx, concept in enumerate(concepts[:7]):
        node_id = f'node_{idx}'
        nodes.append({
            'id': node_id, 'label': concept['name'][:30], 'level': 1,
            'color': colors[idx % len(colors)], 'size': 35,
            'definition': concept.get('description', 'A key concept from the document.')
        })
        links.append({'source': 'main', 'target': node_id})

    return {'nodes': nodes, 'links': links, 'generated_by': generator_type}
