import json
import numpy as np
from datetime import datetime, timedelta
from collections import defaultdict


class MLAnalyticsEngine:
    """Machine Learning-based analytics engine for personalized learning"""

    def __init__(self):
        self.difficulty_weights = {
            'easy': 1.0,
            'medium': 2.0,
            'hard': 3.5
        }

    def calculate_adaptive_difficulty(self, analytics, recent_sessions):
        """
        Calculate optimal difficulty using ML-based approach
        Considers: accuracy, learning velocity, consistency, time patterns
        """
        if not recent_sessions or len(recent_sessions) < 2:
            return 'medium', 0.5  # Default for new users

        # Recent performance (last 10 sessions)
        recent = recent_sessions[-10:]

        # Calculate weighted accuracy by difficulty
        difficulty_performance = defaultdict(lambda: {'correct': 0, 'total': 0})
        for session in recent:
            diff = session.get('difficulty', 'medium')
            correct = session.get('score', 0)
            total = session.get('total_questions', 1)

            difficulty_performance[diff]['correct'] += correct
            difficulty_performance[diff]['total'] += total

        # Calculate accuracy per difficulty
        accuracies = {}
        for diff, stats in difficulty_performance.items():
            if stats['total'] > 0:
                accuracies[diff] = stats['correct'] / stats['total']

        # Calculate learning velocity (improvement over time)
        learning_velocity = self._calculate_learning_velocity(recent)

        # Calculate consistency score
        consistency = self._calculate_consistency(recent)

        # Adaptive decision logic
        current_diff = analytics.get('predicted_difficulty', 'medium')

        # Easy → Medium: 75%+ accuracy consistently
        if current_diff == 'easy':
            if accuracies.get('easy', 0) >= 0.75 and consistency > 0.7:
                return 'medium', 0.7
            return 'easy', accuracies.get('easy', 0.5)

        # Medium → Hard: 80%+ accuracy + positive velocity
        elif current_diff == 'medium':
            medium_acc = accuracies.get('medium', 0)
            if medium_acc >= 0.80 and learning_velocity > 0.1:
                return 'hard', 0.8
            elif medium_acc < 0.50 and learning_velocity < 0:
                return 'easy', medium_acc
            return 'medium', medium_acc

        # Hard: Maintain or drop down
        else:
            hard_acc = accuracies.get('hard', 0)
            if hard_acc < 0.55:
                return 'medium', hard_acc
            return 'hard', hard_acc

    def _calculate_learning_velocity(self, sessions):
        """Calculate rate of improvement over time"""
        if len(sessions) < 3:
            return 0.0

        # Get accuracy for each session
        accuracies = []
        for s in sessions:
            if s.get('total_questions', 0) > 0:
                acc = s.get('score', 0) / s.get('total_questions', 1)
                accuracies.append(acc)

        if len(accuracies) < 3:
            return 0.0

        # Simple linear regression slope
        x = np.arange(len(accuracies))
        y = np.array(accuracies)

        # Calculate slope (velocity)
        slope = np.polyfit(x, y, 1)[0]
        return float(slope)

    def _calculate_consistency(self, sessions):
        """Calculate how consistent the student's performance is"""
        if len(sessions) < 2:
            return 0.5

        accuracies = []
        for s in sessions:
            if s.get('total_questions', 0) > 0:
                acc = s.get('score', 0) / s.get('total_questions', 1)
                accuracies.append(acc)

        if not accuracies:
            return 0.5

        # Lower standard deviation = higher consistency
        std_dev = np.std(accuracies)
        consistency = max(0, 1 - (std_dev * 2))  # Normalize to 0-1
        return consistency

    def calculate_mastery_score(self, analytics):
        """
        Calculate overall mastery score (0-100)
        Considers multiple factors with weighted importance
        """
        total_questions = analytics.get('total_questions', 0)
        correct_answers = analytics.get('correct_answers', 0)

        if total_questions == 0:
            return 0.0

        # Base accuracy score (0-40 points)
        accuracy = (correct_answers / total_questions)
        accuracy_score = accuracy * 40

        # Difficulty mastery (0-30 points)
        easy_acc = self._get_difficulty_accuracy(analytics, 'easy')
        medium_acc = self._get_difficulty_accuracy(analytics, 'medium')
        hard_acc = self._get_difficulty_accuracy(analytics, 'hard')

        difficulty_score = (easy_acc * 0.3 + medium_acc * 0.5 + hard_acc * 0.7) * 30

        # Volume bonus (0-15 points) - rewards practice
        volume_bonus = min(15, (total_questions / 100) * 15)

        # Streak bonus (0-15 points)
        streak = analytics.get('study_streak', 0)
        streak_bonus = min(15, (streak / 30) * 15)

        mastery = accuracy_score + difficulty_score + volume_bonus + streak_bonus
        return min(100, max(0, mastery))

    def _get_difficulty_accuracy(self, analytics, difficulty):
        """Get accuracy for specific difficulty"""
        attempts = analytics.get(f'{difficulty}_attempts', 0)
        correct = analytics.get(f'{difficulty}_correct', 0)

        if attempts == 0:
            return 0.0
        return correct / attempts

    def generate_personalized_recommendations(self, analytics, recent_sessions, user_documents):
        """
        Generate AI-powered personalized quiz recommendations
        """
        recommendations = []

        # Analyze weak areas
        weak_topics = self._identify_weak_topics(analytics)

        # Analyze difficulty comfort zone
        current_difficulty = analytics.get('predicted_difficulty', 'medium')

        # Recommendation 1: Targeted improvement on weak topics
        if weak_topics:
            for topic, performance in weak_topics[:3]:  # Top 3 weak topics
                recommendations.append({
                    'type': 'targeted_practice',
                    'priority': 10 - len(recommendations),
                    'topic': topic,
                    'difficulty': 'easy' if performance < 0.4 else 'medium',
                    'reason': f'You scored {performance * 100:.0f}% on {topic}. Let\'s improve this!',
                    'estimated_time': '10-15 min',
                    'potential_gain': '+15 mastery points'
                })

        # Recommendation 2: Difficulty progression
        if current_difficulty == 'easy':
            easy_acc = self._get_difficulty_accuracy(analytics, 'easy')
            if easy_acc >= 0.75:
                recommendations.append({
                    'type': 'level_up',
                    'priority': 9,
                    'topic': 'General Assessment',
                    'difficulty': 'medium',
                    'reason': f'You\'re mastering easy questions ({easy_acc * 100:.0f}%)! Ready for medium?',
                    'estimated_time': '15-20 min',
                    'potential_gain': 'Unlock medium difficulty'
                })

        elif current_difficulty == 'medium':
            medium_acc = self._get_difficulty_accuracy(analytics, 'medium')
            if medium_acc >= 0.80:
                recommendations.append({
                    'type': 'level_up',
                    'priority': 9,
                    'topic': 'Advanced Challenge',
                    'difficulty': 'hard',
                    'reason': f'Excellent medium performance ({medium_acc * 100:.0f}%)! Try hard difficulty!',
                    'estimated_time': '20-25 min',
                    'potential_gain': 'Unlock hard difficulty'
                })

        # Recommendation 3: Streak maintenance
        streak = analytics.get('study_streak', 0)
        last_activity = analytics.get('last_activity')

        if streak > 0 and last_activity:
            # Check if streak is at risk
            hours_since = (datetime.utcnow() - last_activity).total_seconds() / 3600
            if hours_since > 20 and hours_since < 24:
                recommendations.append({
                    'type': 'streak_saver',
                    'priority': 10,
                    'topic': 'Quick Review',
                    'difficulty': current_difficulty,
                    'reason': f'Don\'t break your {streak}-day streak! Quick quiz to keep it going 🔥',
                    'estimated_time': '5-10 min',
                    'potential_gain': f'Maintain {streak}-day streak'
                })

        # Recommendation 4: Comprehensive review
        total_quizzes = analytics.get('total_quizzes', 0)
        if total_quizzes >= 10 and total_quizzes % 10 == 0:
            recommendations.append({
                'type': 'milestone_review',
                'priority': 7,
                'topic': 'Comprehensive Review',
                'difficulty': current_difficulty,
                'reason': f'You\'ve completed {total_quizzes} quizzes! Time for a comprehensive review.',
                'estimated_time': '25-30 min',
                'potential_gain': '+25 mastery points'
            })

        # Recommendation 5: Document-based practice
        if user_documents:
            for doc in user_documents[:2]:  # Latest 2 documents
                recommendations.append({
                    'type': 'document_practice',
                    'priority': 6,
                    'topic': doc.get('title', 'Recent Upload'),
                    'difficulty': current_difficulty,
                    'reason': 'Practice on your recently uploaded material',
                    'estimated_time': '15-20 min',
                    'potential_gain': '+10 mastery points',
                    'document_id': doc.get('id')
                })

        # Sort by priority
        recommendations.sort(key=lambda x: x['priority'], reverse=True)

        return recommendations[:5]  # Return top 5

    def _identify_weak_topics(self, analytics):
        """Identify topics where student needs improvement"""
        topic_performance_json = analytics.get('topic_performance', '{}')

        try:
            topic_performance = json.loads(topic_performance_json)
        except:
            return []

        weak_topics = []
        for topic, stats in topic_performance.items():
            if stats.get('total', 0) >= 3:  # Only consider topics with enough attempts
                accuracy = stats.get('correct', 0) / stats.get('total', 1)
                if accuracy < 0.70:  # Below 70% is considered weak
                    weak_topics.append((topic, accuracy))

        # Sort by accuracy (lowest first)
        weak_topics.sort(key=lambda x: x[1])
        return weak_topics

    def generate_insights(self, analytics, recent_sessions):
        """Generate AI-powered insights and learning guidance"""
        insights = {
            'overall_status': '',
            'strength_areas': [],
            'improvement_areas': [],
            'learning_velocity': '',
            'next_steps': [],
            'motivational_message': '',
            'predictions': {}
        }

        # Overall mastery
        mastery = self.calculate_mastery_score(analytics)
        total_questions = analytics.get('total_questions', 0)

        if mastery >= 80:
            insights['overall_status'] = '🌟 Outstanding! You\'re a master learner!'
        elif mastery >= 60:
            insights['overall_status'] = '🚀 Great progress! You\'re on the right track!'
        elif mastery >= 40:
            insights['overall_status'] = '📈 Good start! Keep practicing consistently.'
        else:
            insights['overall_status'] = '💪 Just getting started! Every expert was once a beginner.'

        # Identify strengths
        easy_acc = self._get_difficulty_accuracy(analytics, 'easy')
        medium_acc = self._get_difficulty_accuracy(analytics, 'medium')
        hard_acc = self._get_difficulty_accuracy(analytics, 'hard')

        if easy_acc >= 0.75:
            insights['strength_areas'].append('Solid foundation in basic concepts')
        if medium_acc >= 0.70:
            insights['strength_areas'].append('Strong intermediate-level understanding')
        if hard_acc >= 0.60:
            insights['strength_areas'].append('Excellent grasp of advanced topics')

        # Learning velocity
        if recent_sessions:
            velocity = self._calculate_learning_velocity(recent_sessions)
            if velocity > 0.1:
                insights['learning_velocity'] = '📈 Rapidly improving! Your performance is trending up.'
            elif velocity > 0:
                insights['learning_velocity'] = '➡️ Steady progress. Keep up the consistency!'
            elif velocity > -0.1:
                insights['learning_velocity'] = '📊 Maintaining current level. Ready to push further?'
            else:
                insights['learning_velocity'] = '📉 Recent dip noticed. Take a break or review basics?'

        # Improvement areas
        if easy_acc < 0.70 and analytics.get('easy_attempts', 0) > 5:
            insights['improvement_areas'].append('Focus on mastering fundamental concepts')
        if medium_acc < 0.60 and analytics.get('medium_attempts', 0) > 5:
            insights['improvement_areas'].append('Practice more medium-level questions')
        if hard_acc < 0.50 and analytics.get('hard_attempts', 0) > 3:
            insights['improvement_areas'].append('Hard questions need more preparation')

        # Next steps
        current_diff = analytics.get('predicted_difficulty', 'medium')
        if current_diff == 'easy' and easy_acc >= 0.75:
            insights['next_steps'].append('You\'re ready to tackle medium difficulty!')
        elif current_diff == 'medium' and medium_acc >= 0.80:
            insights['next_steps'].append('Challenge yourself with hard difficulty!')
        elif total_questions < 50:
            insights['next_steps'].append('Complete more quizzes to unlock detailed insights')

        # Predictions
        insights['predictions'] = {
            'next_optimal_difficulty': current_diff,
            'estimated_mastery_in_week': min(100, mastery + (velocity * 7 if recent_sessions else 0)),
            'questions_to_next_level': max(0, 50 - (total_questions % 50))
        }

        # Motivational message
        streak = analytics.get('study_streak', 0)
        if streak >= 7:
            insights['motivational_message'] = f'🔥 Amazing {streak}-day streak! You\'re unstoppable!'
        elif streak >= 3:
            insights['motivational_message'] = f'Great {streak}-day streak! Keep the momentum going!'
        elif mastery >= 70:
            insights['motivational_message'] = 'You\'re making excellent progress! Keep it up!'
        else:
            insights['motivational_message'] = 'Every question you answer makes you smarter. You\'ve got this!'

        return insights

    def predict_quiz_performance(self, analytics, difficulty, topic=None):
        """Predict expected performance on a quiz"""
        # Get historical performance for this difficulty
        attempts = analytics.get(f'{difficulty}_attempts', 0)
        correct = analytics.get(f'{difficulty}_correct', 0)

        if attempts == 0:
            # No data, use adjacent difficulty
            if difficulty == 'easy':
                return {'predicted_score': 70, 'confidence': 'low'}
            elif difficulty == 'hard':
                medium_acc = self._get_difficulty_accuracy(analytics, 'medium')
                return {
                    'predicted_score': int(medium_acc * 100 * 0.7),  # Expect 30% drop
                    'confidence': 'medium'
                }
            else:
                easy_acc = self._get_difficulty_accuracy(analytics, 'easy')
                return {
                    'predicted_score': int(easy_acc * 100 * 0.85),  # Expect 15% drop
                    'confidence': 'medium'
                }

        base_accuracy = correct / attempts

        # Adjust for topic if available
        if topic:
            topic_performance_json = analytics.get('topic_performance', '{}')
            try:
                topic_performance = json.loads(topic_performance_json)
                if topic in topic_performance:
                    topic_acc = topic_performance[topic]['correct'] / topic_performance[topic]['total']
                    # Weighted average
                    base_accuracy = (base_accuracy * 0.7 + topic_acc * 0.3)
            except:
                pass

        confidence = 'high' if attempts >= 10 else 'medium' if attempts >= 5 else 'low'

        return {
            'predicted_score': int(base_accuracy * 100),
            'confidence': confidence,
            'recommendation': self._get_performance_recommendation(base_accuracy)
        }

    def _get_performance_recommendation(self, accuracy):
        """Get recommendation based on predicted performance"""
        if accuracy >= 0.80:
            return 'You\'re likely to excel! Try challenging yourself with harder questions.'
        elif accuracy >= 0.65:
            return 'You should do well! Focus and take your time.'
        elif accuracy >= 0.50:
            return 'This might be challenging. Review the material first?'
        else:
            return 'Consider reviewing the basics before attempting this quiz.'
