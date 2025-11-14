import re
import json
import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

class GeminiService:
    """Service for Gemini AI interactions"""

    @staticmethod
    def get_response(question, document_context=""):
        """Get response from Google Gemini AI"""
        if not GEMINI_API_KEY:
            return None

        prompt = f"""You are IntelliLearn AI, a friendly and knowledgeable study assistant for students of all ages.

GUIDELINES:
- Answer questions from ANY subject (Math, Science, History, Literature, Geography, etc.)
- Explain concepts clearly with examples
- Use markdown formatting (**, *, bullet points)
- Add emojis for engagement (but don't overuse)
- Keep answers 2-4 paragraphs unless detailed explanation is needed
- For math problems, show step-by-step calculations
- Be encouraging and supportive
- End with a helpful follow-up question

STUDENT'S QUESTION: {question}"""

        if document_context:
            prompt += f"\n\nSTUDENT'S STUDY MATERIAL:\n{document_context}\n\nIf the question relates to this material, reference it in your answer."

        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    temperature=0.7,
                    top_p=0.95,
                    top_k=40,
                    max_output_tokens=1000,
                )
            )
            answer = response.text.strip()
            answer += "\n\n💡 *Have another question? I'm here to help!*"
            return answer
        except Exception as e:
            print(f"❌ Gemini error: {e}")
            return None

    @staticmethod
    def extract_concepts(text):
        """Extract key concepts from text using Gemini"""
        if not GEMINI_API_KEY:
            return GeminiService._extract_concepts_simple(text)

        prompt = f"""From the text below, extract the 5-7 most important key concepts.
TEXT: {text[:3000]}
Return ONLY a valid JSON array of objects. Each object must have "name" (string, 2-4 words max) and "description" (string, 1 brief sentence).
Example: [{{"name": "Machine Learning", "description": "A field of AI focused on training models from data."}}]"""

        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(prompt, generation_config={'temperature': 0.2, 'max_output_tokens': 800})
            text_response = response.text.strip()
            json_match = re.search(r'\[.*\]', text_response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
        except Exception as e:
            print(f"❌ Concept extraction error: {e}")

        return GeminiService._extract_concepts_simple(text)

    @staticmethod
    def _extract_concepts_simple(text):
        """Fallback concept extraction"""
        words = re.findall(r'\b[A-Z][a-z]{3,}(?:\s+[A-Z][a-z]+)*\b', text)
        word_freq = {}
        for word in words:
            if word not in ['The', 'This', 'That', 'These', 'There']:
                word_freq[word] = word_freq.get(word, 0) + 1
        top_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:6]
        return [{'name': word, 'description': f'A key concept mentioned {freq} times in the document.'} for word, freq in top_words]

    @staticmethod
    def explain_concept(concept, document_context=""):
        """Get AI explanation for a concept"""
        if not GEMINI_API_KEY:
            return GeminiService._fallback_concept_explanation(concept)

        prompt = f"""Explain this concept for a student in 2-3 clear sentences. Also provide 3 key bullet points.
CONCEPT: {concept}
CONTEXT: {document_context}
Return ONLY a valid JSON object with "explanation" (string) and "keyPoints" (array of strings).
Example: {{"explanation": "...", "keyPoints": ["...", "...", "..."]}}"""

        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(prompt)
            text_response = response.text.strip()
            json_match = re.search(r'\{.*\}', text_response, re.DOTALL)

            if json_match:
                return json.loads(json_match.group(0))
        except Exception as e:
            print(f"❌ Concept explanation error: {e}")

        return GeminiService._fallback_concept_explanation(concept)

    @staticmethod
    def _fallback_concept_explanation(concept):
        """Fallback concept explanation"""
        return {
            'explanation': f'{concept} is a core idea in your study material. It connects several key themes and is important to understand fully.',
            'keyPoints': ['This is a fundamental topic.', 'Review the related sections in your document.', 'Try to apply this concept with practice problems.']
        }

    @staticmethod
    def test_connection():
        """Test Gemini connection"""
        if not GEMINI_API_KEY:
            return {'status': 'error', 'message': 'API key not found'}

        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content("Say 'Hello! I am working perfectly!'")
            return {
                'status': 'success',
                'message': 'Gemini is working!',
                'model': 'gemini-2.5-flash',
                'test_response': response.text
            }
        except Exception as e:
            return {'status': 'error', 'message': str(e)}
