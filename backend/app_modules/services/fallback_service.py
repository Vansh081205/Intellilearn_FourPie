import re

class FallbackResponseService:
    """Fallback responses when AI is unavailable"""

    @staticmethod
    def get_response(question, document_context=""):
        """Get fallback response based on question type"""
        q = question.lower().strip()

        # Greetings
        if any(w in q for w in ['hello', 'hi', 'hey', 'greetings']):
            return """Hello! 👋 I'm **IntelliLearn AI**, your study companion!

I can help with:
📐 Math • 🔬 Science • 📚 History • 📖 Literature • 🌍 Geography • 💻 Computer Science

**From elementary to university level!**

What would you like to learn today?"""

        # Gratitude
        if any(w in q for w in ['thank', 'thanks', 'thx']):
            return "You're very welcome! 😊 Keep asking questions - that's how we learn best! What else can I help you with?"

        # Personal questions
        if 'how are you' in q:
            return "I'm doing great! 🤖✨ Ready to help you learn anything. What topic interests you today?"

        if 'who are you' in q or 'what is your name' in q:
            return "I'm IntelliLearn AI, powered by Google Gemini! Your 24/7 study assistant for ANY subject. What can I help you learn? 🎓"

        # Multiplication tables
        table_match = re.search(r'table\s+(?:of\s+)?(\d+)|(\d+)\s+table', q)
        if table_match:
            num = int(table_match.group(1) or table_match.group(2))
            if num > 100:
                return "That's quite large! Try a number between 1-20 for practice! 😊"

            table = '\n'.join([f"{num} × {i:2d} = {num * i:4d}" for i in range(1, 11)])
            tips = {
                2: "💡 **Tip:** Just double the number!",
                5: "💡 **Pattern:** Always ends in 0 or 5!",
                9: "💡 **Magic:** Digits always sum to 9!",
                10: "💡 **Easy:** Just add a zero!"
            }
            tip = tips.get(num, "💡 Practice makes perfect!")

            return f"""📊 **Multiplication Table for {num}:**
{table}

{tip}

Want another table or a different question?"""

        # Math calculations
        # Multiplication
        mult = re.search(r'(\d+)\s*[x×*]\s*(\d+)', q)
        if mult:
            a, b = int(mult.group(1)), int(mult.group(2))
            return f"""🧮 **{a} × {b} = {a * b}**

💡 Think of it as: {a} groups of {b}!

Need another calculation?"""

        # Addition
        add = re.search(r'(\d+)\s*\+\s*(\d+)', q)
        if add:
            a, b = int(add.group(1)), int(add.group(2))
            return f"➕ **{a} + {b} = {a + b}**\n\nAnother one?"

        # Subtraction
        sub = re.search(r'(\d+)\s*-\s*(\d+)', q)
        if sub:
            a, b = int(sub.group(1)), int(sub.group(2))
            return f"➖ **{a} - {b} = {a - b}**\n\nMore practice?"

        # Division
        div = re.search(r'(\d+)\s*[/÷]\s*(\d+)', q)
        if div:
            a, b = int(div.group(1)), int(div.group(2))
            if b == 0:
                return "❌ Cannot divide by zero! Try a different divisor."
            result = a / b
            if result.is_integer():
                return f"➗ **{a} ÷ {b} = {int(result)}**"
            return f"➗ **{a} ÷ {b} = {result:.2f}**"

        # Help menu
        if 'help' in q or 'what can you do' in q:
            return """🎓 **I'm Your Universal Study Assistant!**

**📚 I can help with ANY subject:**

**Math** 📐
• Arithmetic, Algebra, Geometry
• Calculus, Statistics

**Science** 🔬
• Physics, Chemistry, Biology
• Environmental Science

**Humanities** 📖
• History, Geography
• Literature, Languages

**Technology** 💻
• Computer Science
• Programming

**Just ask naturally!**
• "Explain photosynthesis"
• "What is Newton's first law?"
• "Solve 2x + 5 = 15"
• "Who wrote Romeo and Juliet?"

What would you like to learn? 😊"""

        # Document context
        if document_context:
            preview = document_context[:400]
            return f"""📄 **From your study material:**

{preview}...

Ask me a specific question about this content!

What would you like me to explain?"""

        # Default
        return """I'm here to help you learn! 😊

**Try asking:**
• Math: *"table of 7"*, *"solve 2x + 5 = 15"*
• Science: *"explain photosynthesis"*, *"Newton's laws"*
• History: *"What caused World War 2?"*
• Literature: *"Who was Shakespeare?"*

**Or say "help" to see all my features!**

What topic are you studying?"""
