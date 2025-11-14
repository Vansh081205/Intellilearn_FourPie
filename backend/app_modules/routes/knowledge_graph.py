from flask import Blueprint, request, jsonify
from app_modules.models import db, Document, User
from app_modules.services.gemini_service import GeminiService
from app_modules.utils.graph_builder import build_graph_structure

knowledge_graph_bp = Blueprint('knowledge_graph', __name__, url_prefix='/api/knowledge-graph')

@knowledge_graph_bp.route('/generate', methods=['POST'])
def generate_knowledge_graph():
    try:
        doc_id = request.json.get('doc_id')
        if not doc_id:
            return jsonify({'error': 'Document ID is required'}), 400

        doc = Document.query.get(doc_id)
        if not doc:
            return jsonify({'error': f'Document with ID {doc_id} not found'}), 404

        print(f"📊 Generating graph for: {doc.filename}")

        concepts = GeminiService.extract_concepts(doc.text_content)
        generator_type = 'ai' if concepts else 'simple'
        print(f"✅ AI extracted {len(concepts)} concepts")

        return jsonify(build_graph_structure(concepts, doc.filename, generator_type))

    except Exception as e:
        print(f"💥 Fatal Error in knowledge graph: {e}")
        return jsonify({'error': str(e)}), 500

@knowledge_graph_bp.route('/explain/<concept>', methods=['POST'])
def explain_concept(concept):
    """Get AI explanation for a concept"""
    try:
        print(f"💭 Explaining concept: {concept}")

        context = ""
        doc_id = request.json.get('doc_id')
        if doc_id:
            doc = Document.query.get(doc_id)
            if doc:
                context = doc.text_content[:2000]

        explanation_data = GeminiService.explain_concept(concept, context)
        print(f"✅ AI explanation generated for '{concept}'")
        return jsonify(explanation_data)

    except Exception as e:
        print(f"💥 Fatal error explaining concept: {e}")
        return jsonify({'error': str(e)}), 500
