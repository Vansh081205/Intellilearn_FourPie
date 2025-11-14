class AdaptiveEngine:
    def __init__(self):
        self.user_stats = {}
    
    def calculate_difficulty(self, user_id, quiz_history):
        if not quiz_history or len(quiz_history) < 3:
            return "medium"
        
        recent = quiz_history[-5:]
        accuracy = sum(1 for q in recent if q['correct']) / len(recent)
        
        if accuracy >= 0.8:
            return "hard"
        elif accuracy >= 0.5:
            return "medium"
        else:
            return "easy"
    
    def get_insights(self, user_id, quiz_history):
        if not quiz_history:
            return {
                "total_questions": 0,
                "accuracy": 0,
                "current_level": "medium",
                "message": "Start your first quiz to see insights!"
            }
        
        total = len(quiz_history)
        correct = sum(1 for q in quiz_history if q['correct'])
        accuracy = (correct / total) * 100
        
        recent_trend = self.calculate_difficulty(user_id, quiz_history)
        
        if accuracy >= 80:
            message = "Excellent! You're mastering this topic!"
        elif accuracy >= 60:
            message = "Good progress! Keep going!"
        elif accuracy >= 40:
            message = "You're improving! Practice more."
        else:
            message = "Don't give up! Let's try easier questions."
        
        return {
            "total_questions": total,
            "accuracy": round(accuracy, 1),
            "current_level": recent_trend,
            "message": message
        }