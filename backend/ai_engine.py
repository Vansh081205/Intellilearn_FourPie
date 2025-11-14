from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lex_rank import LexRankSummarizer
import yake
import re
import random
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords

# Auto-download NLTK data if missing
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('tokenizers/punkt_tab')
except LookupError:
    print("Downloading required NLTK data...")
    nltk.download('punkt', quiet=True)
    nltk.download('punkt_tab', quiet=True)
    nltk.download('stopwords', quiet=True)
    print("NLTK data downloaded successfully!")


# --- Simple sentence splitter ---
def _sentences(text):
    sents = re.split(r'(?<=[.!?])\s+', text.strip())
    return [s.strip() for s in sents if s.strip()]


# --- AI Summary Generator ---
def generate_summary(text, difficulty="medium", sent_count=None):
    try:
        # Difficulty / length logic
        if sent_count:
            target_sents = sent_count
        elif difficulty == "easy":
            target_sents = 4
        elif difficulty == "hard":
            target_sents = 12
        else:
            target_sents = 7

        parser = PlaintextParser.from_string(text, Tokenizer("english"))
        summarizer = LexRankSummarizer()
        summary_sents = summarizer(parser.document, target_sents)

        # Fallback if LexRank gives nothing
        if not summary_sents:
            sents = _sentences(text)
            summary_sents = sents[:target_sents]

        # Convert to text list
        summary_list = [str(s).strip() for s in summary_sents if str(s).strip()]

        # Cleanup formatting
        formatted_lines = []
        for line in summary_list:
            # Remove double spaces, fix capitalization
            clean = re.sub(r'\s+', ' ', line).strip()
            clean = clean[0].upper() + clean[1:] if clean else ""
            formatted_lines.append(f"• {clean}")

        # Build final formatted summary
        final = "🧠 **Here’s your AI-generated summary:**\n\n"
        final += "\n".join(formatted_lines)
        final += "\n\n✨ *End of summary — concise and insightful!*"

        return final.strip()

    except Exception as e:
        return f"⚠️ Summary Error (local): {str(e)}"

# --- AI Quiz Generator ---
def generate_quiz(text, difficulty="medium", num_questions=5):
    try:
        sents = _sentences(text)
        if not sents:
            return [{
                "question": "Document is too short to create a quiz.",
                "options": ["A) OK", "B) -", "C) -", "D) -"],
                "correct": "A",
                "explanation": "Please upload a document with more content."
            }]

        # --- Keyword extraction (YAKE) ---
        top_k = 50
        kw_extractor = yake.KeywordExtractor(lan="en", n=3, top=top_k, dedupLim=0.9)
        kw_pairs = kw_extractor.extract_keywords(text)

        # --- Clean keywords ---
        keywords = []
        seen = set()
        for kw, score in kw_pairs:
            k = kw.strip()
            if len(k) >= 4 and k.lower() not in seen and not re.match(r'^\d+$', k):
                keywords.append(k)
                seen.add(k.lower())

        # Fallback: if YAKE fails
        if not keywords:
            words = [w for w in re.findall(r'[A-Za-z]{4,}', text)]
            keywords = list({w for w in words})[:50]

        # --- Helper Functions ---
        def find_sentence_for_kw(kw):
            """Finds a clean, medium-length sentence containing the keyword."""
            pattern = re.compile(re.escape(kw), re.IGNORECASE)
            for s in sents:
                if 40 < len(s) < 250 and pattern.search(s):
                    return s
            return None

        def jaccard(a: str, b: str) -> float:
            sa, sb = set(a.lower().split()), set(b.lower().split())
            return len(sa & sb) / len(sa | sb) if sa and sb else 0.0

        def filter_distractors(correct, pool):
            """Remove distractors too similar to correct answer."""
            result = []
            for d in pool:
                if jaccard(d, correct) < 0.5 and d.lower() != correct.lower():
                    result.append(d)
            return result

        # --- Quiz creation ---
        questions = []
        used_sents = set()
        random.shuffle(keywords)

        for kw in keywords:
            sent = find_sentence_for_kw(kw)
            if not sent or sent in used_sents:
                continue

            pattern = re.compile(re.escape(kw), re.IGNORECASE)
            q_text = pattern.sub("____", sent, count=1)
            if "____" not in q_text:
                continue

            correct = kw.strip()
            distractor_pool = [k for k in keywords if k.lower() != correct.lower()]
            distractors = filter_distractors(correct, distractor_pool)
            random.shuffle(distractors)
            distractors = distractors[:3]

            # Fallback if not enough distractors
            if len(distractors) < 3:
                extra_words = [w for w in re.findall(r'[A-Za-z]{4,}', text)]
                random.shuffle(extra_words)
                for e in extra_words:
                    if e.lower() != correct.lower() and e not in distractors:
                        distractors.append(e)
                    if len(distractors) >= 3:
                        break

            if len(distractors) < 3:
                continue

            # --- Difficulty adjustment ---
            if difficulty == "hard":
                random.shuffle(distractors)
                distractors = sorted(distractors, key=lambda x: jaccard(x, correct), reverse=True)[:3]

            options = [correct] + distractors
            random.shuffle(options)

            letters = ["A", "B", "C", "D"]
            opt_fmt, correct_letter = [], None
            for idx, opt in enumerate(options):
                opt_fmt.append(f"{letters[idx]}) {opt}")
                if opt.strip().lower() == correct.lower():
                    correct_letter = letters[idx]

            if not correct_letter:
                continue

            # --- Smarter question phrasing ---
            question_prefixes = [
                "Fill in the blank:",
                "Which word best completes the sentence?",
                "Choose the correct term for the blank:",
                "Select the missing concept:"
            ]
            prefix = random.choice(question_prefixes)

            questions.append({
                "question": f"{prefix} {q_text}",
                "options": opt_fmt,
                "correct": correct_letter,
                "explanation": f"In the original text, the blank was '{correct}'."
            })

            used_sents.add(sent)
            if len(questions) >= num_questions:
                break

        # --- Fallback if no valid questions ---
        if not questions:
            return [{
                "question": "Which of the following best matches a key concept in the document?",
                "options": [
                    f"A) {keywords[0] if keywords else 'Concept'}",
                    "B) Placeholder",
                    "C) Placeholder",
                    "D) Placeholder"
                ],
                "correct": "A",
                "explanation": "Fallback question from keyword extraction."
            }]

        return questions

    except Exception as e:
        return [{
            "question": "Quiz generation failed.",
            "options": ["A) OK", "B) -", "C) -", "D) -"],
            "correct": "A",
            "explanation": f"Local quiz error: {str(e)}"
        }]

# --- Explain Like I'm 5 ---
def explain_eli5(text):
    """
    Simplifies complex text into easy, child-friendly explanations.
    """
    try:
        # Generate a short summary first
        easy_summary = generate_summary(text, "easy")

        # Extract key points (• bullets or - lines)
        bullets = [ln.replace("•", "").replace("- ", "").strip() 
                   for ln in easy_summary.splitlines() 
                   if ln.strip().startswith(("•", "-"))]

        # Fallback if not enough bullets
        if not bullets:
            bullets = _sentences(text)[:5]

        # Clean up bullets
        simplified_points = []
        for point in bullets:
            # Remove extra punctuation and complex phrases
            point = re.sub(r'\([^)]*\)', '', point)  # remove parentheses
            point = re.sub(r'[^A-Za-z0-9 ,.!?\'"]+', '', point).strip()
            point = point.capitalize()

            # Make it more "kid-friendly" phrasing
            replacements = {
                "therefore": "so",
                "however": "but",
                "thus": "so",
                "in addition": "also",
                "moreover": "also",
                "significant": "important",
                "approximately": "around",
                "utilize": "use",
                "demonstrate": "show",
                "concept": "idea",
                "complex": "hard",
                "objective": "goal",
                "advantage": "good thing",
                "disadvantage": "bad thing"
            }
            for k, v in replacements.items():
                point = re.sub(rf"\b{k}\b", v, point, flags=re.IGNORECASE)

            # Simplify long sentences
            words = point.split()
            if len(words) > 15:
                point = " ".join(words[:15]) + "..."

            simplified_points.append(point)

        # Create the final friendly explanation
        output = "🧒 **Explain Like I'm 5:**\n\n"
        for sp in simplified_points[:6]:
            output += f"• {sp}\n"

        output += (
            "\n✨ In simple words: This text is about something important, "
            "and here’s what it means in an easy way!"
        )

        return output.strip()

    except Exception as e:
        return f"⚠️ ELI5 generation failed: {str(e)}"


def generate_summary(text, difficulty="medium", sent_count=None):
    try:
        # Auto-download NLTK data if missing
        try:
            nltk.data.find("tokenizers/punkt")
        except LookupError:
            nltk.download("punkt")

        # Difficulty / length logic
        if sent_count:
            target_sents = sent_count
        elif difficulty == "easy":
            target_sents = 4
        elif difficulty == "hard":
            target_sents = 12
        else:
            target_sents = 7

        parser = PlaintextParser.from_string(text, Tokenizer("english"))
        summarizer = LexRankSummarizer()
        summary_sents = summarizer(parser.document, target_sents)

        # Fallback if LexRank gives nothing
        if not summary_sents:
            sents = _sentences(text)
            summary_sents = sents[:target_sents]

        # Convert to text list
        summary_list = [str(s).strip() for s in summary_sents if str(s).strip()]

        # Cleanup formatting
        formatted_lines = []
        for line in summary_list:
            # Remove double spaces, fix capitalization
            clean = re.sub(r'\s+', ' ', line).strip()
            clean = clean[0].upper() + clean[1:] if clean else ""
            formatted_lines.append(f"• {clean}")

        # Build final formatted summary
        final = "🧠 **Here’s your AI-generated summary:**\n\n"
        final += "\n".join(formatted_lines)
        final += "\n\n✨ *End of summary — concise and insightful!*"

        return final.strip()

    except Exception as e:
        return f"⚠️ Summary Error (local): {str(e)}"

