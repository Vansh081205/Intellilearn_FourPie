"""
Educational Data Analyst & Adaptive Learning Engine
Classifies students based on Learning Capacity, Progress Trajectory, and Error Patterns
"""

import json
import numpy as np
from datetime import datetime, timedelta
from collections import defaultdict


class EducationalDataAnalyst:
    """
    Advanced student classification engine for personalized interventions
    """

    def __init__(self):
        # Thresholds for classification
        self.capacity_thresholds = {
            'fast_adapter': {'avg_attempts': 1.5, 'avg_time_percentile': 0.3, 'accuracy': 0.8},
            'steady_builder': {'avg_attempts': 2.5, 'avg_time_percentile': 0.6, 'accuracy': 0.65},
            'needs_scaffolding': {'avg_attempts': 3.0, 'avg_time_percentile': 0.8, 'accuracy': 0.5}
        }

        self.trajectory_windows = {
            'recent': 5,  # Last 5 sessions
            'historical': 15  # Last 15 sessions
        }

    def classify_student(self, student_data):
        """
        Main classification method - analyzes all dimensions
        
        Args:
            student_data: dict containing:
                - user_id
                - quiz_sessions: list of session data
                - question_attempts: list of question-level data
                - concept_mastery: dict of concept performance
        
        Returns:
            dict: Complete classification profile
        """
        user_id = student_data['user_id']
        sessions = student_data.get('quiz_sessions', [])
        questions = student_data.get('question_attempts', [])
        concepts = student_data.get('concept_mastery', {})

        if not sessions or len(sessions) < 3:
            return self._insufficient_data_response(user_id)

        # Perform multi-dimensional classification
        capacity = self._classify_capacity(sessions, questions)
        trajectory = self._classify_trajectory(sessions)
        error_pattern = self._classify_error_pattern(questions, concepts)

        # Generate intervention strategy
        intervention = self._generate_intervention(capacity, trajectory, error_pattern)

        return {
            'student_id': user_id,
            'classification': {
                'capacity': capacity['category'],
                'capacity_confidence': capacity['confidence'],
                'trajectory': trajectory['category'],
                'trajectory_confidence': trajectory['confidence'],
                'primary_error_pattern': error_pattern['category'],
                'error_confidence': error_pattern['confidence']
            },
            'detailed_analysis': {
                'capacity_evidence': capacity['evidence'],
                'trajectory_data': trajectory['trend_data'],
                'error_examples': error_pattern['examples']
            },
            'recommended_intervention': intervention['strategy'],
            'intervention_priority': intervention['priority'],
            'actionable_insights': intervention['insights']
        }

    def _classify_capacity(self, sessions, questions):
        """
        Classify Learning Capacity: Fast Adapter, Steady Builder, Needs Scaffolding
        
        Metrics:
        - Average time per question
        - Number of attempts to master concepts
        - Final accuracy scores
        """
        if not questions:
            # Fallback to session-level data
            total_time = sum(s.get('duration', 0) for s in sessions)
            total_questions = sum(s.get('total_questions', 1) for s in sessions)
            avg_time_per_question = total_time / max(total_questions, 1)
            avg_accuracy = np.mean([s.get('score', 0) / max(s.get('total_questions', 1), 1) for s in sessions])

            evidence = {
                'avg_time_per_question': round(avg_time_per_question, 2),
                'avg_accuracy': round(avg_accuracy, 2),
                'sample_size': len(sessions)
            }
        else:
            # Detailed question-level analysis
            avg_time_per_question = np.mean([q.get('time_spent', 30) for q in questions])
            avg_attempts = np.mean([q.get('attempts_on_question', 1) for q in questions])
            accuracy = sum(1 for q in questions if q.get('is_correct', False)) / len(questions)

            # Calculate time percentile (compared to typical ranges)
            time_percentile = min(avg_time_per_question / 60.0, 1.0)  # Normalize to 1

            evidence = {
                'avg_time_per_question': round(avg_time_per_question, 2),
                'avg_attempts_per_concept': round(avg_attempts, 2),
                'overall_accuracy': round(accuracy, 2),
                'time_percentile': round(time_percentile, 2),
                'sample_size': len(questions)
            }

        # Classification logic
        if 'avg_attempts' in evidence:
            avg_attempts = evidence['avg_attempts_per_concept']
            time_perc = evidence['time_percentile']
            acc = evidence['overall_accuracy']

            # Fast Adapter: Quick, few attempts, high accuracy
            if avg_attempts <= 1.5 and time_perc <= 0.3 and acc >= 0.8:
                category = 'Fast Adapter'
                confidence = 0.9
            # Steady Builder: Moderate speed, 2-3 attempts, good mastery
            elif avg_attempts <= 2.5 and time_perc <= 0.6 and acc >= 0.65:
                category = 'Steady Builder'
                confidence = 0.8
            # Needs Scaffolding: Slow, many attempts, low mastery
            elif avg_attempts >= 3.0 or time_perc >= 0.8 or acc < 0.5:
                category = 'Needs Scaffolding'
                confidence = 0.85
            else:
                # Edge case: between categories
                if acc >= 0.70:
                    category = 'Steady Builder'
                    confidence = 0.6
                else:
                    category = 'Needs Scaffolding'
                    confidence = 0.6
        else:
            # Simpler classification without attempt data
            acc = evidence['avg_accuracy']
            avg_time = evidence['avg_time_per_question']

            if acc >= 0.8 and avg_time <= 20:
                category = 'Fast Adapter'
                confidence = 0.7
            elif acc >= 0.65 and avg_time <= 35:
                category = 'Steady Builder'
                confidence = 0.7
            else:
                category = 'Needs Scaffolding'
                confidence = 0.7

        return {
            'category': category,
            'confidence': confidence,
            'evidence': evidence
        }

    def _classify_trajectory(self, sessions):
        """
        Classify Progress Trajectory: Accelerating, Plateauing, Regressing
        
        Analyzes score trends over time using linear regression
        """
        if len(sessions) < 3:
            return {
                'category': 'Insufficient Data',
                'confidence': 0.0,
                'trend_data': []
            }

        # Sort by date
        sorted_sessions = sorted(sessions, key=lambda s: s.get('created_at', ''))

        # Extract accuracy over time
        accuracies = []
        dates = []
        for s in sorted_sessions:
            score = s.get('score', 0)
            total = s.get('total_questions', 1)
            accuracy = (score / total) * 100 if total > 0 else 0
            accuracies.append(accuracy)
            dates.append(s.get('created_at', ''))

        # Calculate trend using linear regression
        x = np.arange(len(accuracies))
        y = np.array(accuracies)

        # Simple linear fit
        if len(x) >= 2:
            slope = np.polyfit(x, y, 1)[0]
        else:
            slope = 0

        # Calculate recent vs historical performance
        recent_window = min(5, len(accuracies))
        recent_avg = np.mean(accuracies[-recent_window:])

        if len(accuracies) > recent_window:
            historical_avg = np.mean(accuracies[:-recent_window])
        else:
            historical_avg = recent_avg

        # Calculate variance (consistency)
        variance = np.std(accuracies)

        # Classification logic
        improvement = recent_avg - historical_avg

        # Accelerating: Positive slope, recent > historical
        if slope > 2.0 and improvement > 5:
            category = 'Accelerating'
            confidence = min(0.95, 0.7 + (slope / 20))
        # Regressing: Negative slope, recent < historical
        elif slope < -2.0 and improvement < -5:
            category = 'Regressing'
            confidence = min(0.95, 0.7 + (abs(slope) / 20))
        # Plateauing: Flat slope, similar performance
        elif abs(slope) <= 2.0 and abs(improvement) <= 5:
            category = 'Plateauing'
            confidence = 0.8 if variance < 10 else 0.6
        else:
            # Edge cases
            if improvement > 0:
                category = 'Accelerating'
                confidence = 0.6
            elif improvement < 0:
                category = 'Regressing'
                confidence = 0.6
            else:
                category = 'Plateauing'
                confidence = 0.5

        trend_data = [
            {
                'session': i + 1,
                'accuracy': round(acc, 1),
                'date': dates[i] if i < len(dates) else None
            }
            for i, acc in enumerate(accuracies)
        ]

        return {
            'category': category,
            'confidence': confidence,
            'trend_data': trend_data,
            'metrics': {
                'slope': round(slope, 2),
                'recent_avg': round(recent_avg, 1),
                'historical_avg': round(historical_avg, 1),
                'improvement': round(improvement, 1),
                'variance': round(variance, 1)
            }
        }

    def _classify_error_pattern(self, questions, concepts):
        """
        Classify Error Pattern: Foundational Gap, Application Error, Precision/Attention
        
        Analyzes types of mistakes to identify root causes
        """
        if not questions:
            return {
                'category': 'Insufficient Data',
                'confidence': 0.0,
                'examples': []
            }

        # Separate correct and incorrect attempts
        incorrect_attempts = [q for q in questions if not q.get('is_correct', False)]

        if not incorrect_attempts:
            return {
                'category': 'No Errors (Excellent)',
                'confidence': 1.0,
                'examples': []
            }

        # Analyze error patterns
        foundational_errors = 0
        application_errors = 0
        precision_errors = 0

        examples = {
            'foundational': [],
            'application': [],
            'precision': []
        }

        for q in incorrect_attempts:
            time_spent = q.get('time_spent', 30)
            difficulty = q.get('difficulty', 'medium')
            question_text = q.get('question_text', '')

            # Heuristics for error classification

            # Precision/Attention: Fast time + wrong answer = careless
            if time_spent < 10 and difficulty in ['easy', 'medium']:
                precision_errors += 1
                examples['precision'].append({
                    'question': question_text[:100],
                    'time_spent': time_spent,
                    'reason': 'Fast completion with error suggests careless mistake'
                })

            # Foundational Gap: Easy questions wrong = missing basics
            elif difficulty == 'easy':
                foundational_errors += 1
                examples['foundational'].append({
                    'question': question_text[:100],
                    'difficulty': difficulty,
                    'reason': 'Error on easy question indicates foundational gap'
                })

            # Application Error: Hard questions wrong after trying = understands theory but struggles with application
            elif difficulty == 'hard' and time_spent > 30:
                application_errors += 1
                examples['application'].append({
                    'question': question_text[:100],
                    'time_spent': time_spent,
                    'reason': 'Long time on hard question suggests application difficulty'
                })

            # Default to application error for medium difficulty
            else:
                application_errors += 1
                examples['application'].append({
                    'question': question_text[:100],
                    'time_spent': time_spent,
                    'reason': 'Moderate difficulty with error'
                })

        # Determine primary error pattern
        total_errors = len(incorrect_attempts)
        foundational_ratio = foundational_errors / total_errors
        application_ratio = application_errors / total_errors
        precision_ratio = precision_errors / total_errors

        # Classification
        if foundational_ratio >= 0.4:
            category = 'Foundational Gap'
            confidence = min(0.95, 0.6 + foundational_ratio * 0.4)
            primary_examples = examples['foundational'][:3]
        elif precision_ratio >= 0.4:
            category = 'Precision/Attention'
            confidence = min(0.95, 0.6 + precision_ratio * 0.4)
            primary_examples = examples['precision'][:3]
        elif application_ratio >= 0.4:
            category = 'Application Error'
            confidence = min(0.95, 0.6 + application_ratio * 0.4)
            primary_examples = examples['application'][:3]
        else:
            # Mixed errors - choose most common
            if foundational_errors >= application_errors and foundational_errors >= precision_errors:
                category = 'Foundational Gap'
                primary_examples = examples['foundational'][:3]
            elif application_errors >= precision_errors:
                category = 'Application Error'
                primary_examples = examples['application'][:3]
            else:
                category = 'Precision/Attention'
                primary_examples = examples['precision'][:3]
            confidence = 0.5

        return {
            'category': category,
            'confidence': confidence,
            'examples': primary_examples,
            'distribution': {
                'foundational': round(foundational_ratio * 100, 1),
                'application': round(application_ratio * 100, 1),
                'precision': round(precision_ratio * 100, 1)
            }
        }

    def _generate_intervention(self, capacity, trajectory, error_pattern):
        """
        Generate personalized intervention strategy based on classification
        """
        cap_cat = capacity['category']
        traj_cat = trajectory['category']
        error_cat = error_pattern['category']

        # Determine priority
        if traj_cat == 'Regressing' or error_cat == 'Foundational Gap':
            priority = 'critical'
        elif cap_cat == 'Needs Scaffolding' or traj_cat == 'Plateauing':
            priority = 'high'
        elif cap_cat == 'Steady Builder' and error_cat != 'No Errors (Excellent)':
            priority = 'medium'
        else:
            priority = 'low'

        # Generate strategy based on profile combination
        strategies = {
            ('Fast Adapter', 'Accelerating', 'No Errors (Excellent)'):
                "Provide advanced challenges and leadership opportunities; consider peer tutoring role.",
            ('Fast Adapter', 'Accelerating', 'Application Error'):
                "Introduce complex problem-solving scenarios and real-world applications to deepen understanding.",
            ('Fast Adapter', 'Plateauing', 'Precision/Attention'):
                "Emphasize careful review; introduce time-management strategies and attention-to-detail exercises.",

            ('Steady Builder', 'Accelerating', 'Application Error'):
                "Provide structured practice with guided examples before independent application problems.",
            ('Steady Builder', 'Plateauing', 'Foundational Gap'):
                "Review prerequisite concepts with targeted mini-lessons and scaffolded practice.",
            ('Steady Builder', 'Regressing', 'Application Error'):
                "Reduce difficulty temporarily; use worked examples and step-by-step problem breakdowns.",

            ('Needs Scaffolding', 'Accelerating', 'Foundational Gap'):
                "Continue intensive foundational review with frequent check-ins; celebrate incremental progress.",
            ('Needs Scaffolding', 'Plateauing', 'Foundational Gap'):
                "Implement one-on-one tutoring focused on building prerequisite skills before advancing.",
            ('Needs Scaffolding', 'Regressing', 'Foundational Gap'):
                "URGENT: Provide immediate intensive intervention with basic concepts; consider alternative learning modalities.",
            ('Needs Scaffolding', 'Plateauing', 'Application Error'):
                "Break down complex problems into smaller steps; use visual aids and manipulatives.",
            ('Needs Scaffolding', 'Regressing', 'Precision/Attention'):
                "Reduce cognitive load; implement checklists and error-tracking sheets to build mindful habits."
        }

        # Get specific strategy or use default
        key = (cap_cat, traj_cat, error_cat)
        if key in strategies:
            strategy = strategies[key]
        else:
            # Default strategy based on most critical factor
            if error_cat == 'Foundational Gap':
                strategy = "Focus on building strong foundational understanding before advancing to complex topics."
            elif error_cat == 'Application Error':
                strategy = "Provide more practice with application problems using scaffolded support."
            elif error_cat == 'Precision/Attention':
                strategy = "Implement error-checking routines and encourage slowing down to review work."
            elif traj_cat == 'Regressing':
                strategy = "Pause advancement; review recent material and rebuild confidence with achievable goals."
            elif cap_cat == 'Needs Scaffolding':
                strategy = "Provide step-by-step guidance with frequent positive reinforcement and check-ins."
            else:
                strategy = "Continue current approach with gradual increase in challenge level."

        # Generate actionable insights
        insights = []

        # Capacity-based insights
        if cap_cat == 'Fast Adapter':
            insights.append("This student learns quickly - provide enrichment and avoid repetitive practice.")
        elif cap_cat == 'Steady Builder':
            insights.append("This student benefits from consistent practice and gradual complexity increases.")
        else:
            insights.append("This student needs extra time and support - break lessons into smaller chunks.")

        # Trajectory-based insights
        if traj_cat == 'Accelerating':
            insights.append("Performance is improving - maintain motivation with positive feedback and new challenges.")
        elif traj_cat == 'Plateauing':
            insights.append("Student has hit a plateau - introduce new teaching methods or take a different approach.")
        else:
            insights.append(
                "Performance is declining - investigate causes (motivation, personal issues, content difficulty).")

        # Error-based insights
        if error_cat == 'Foundational Gap':
            insights.append(
                "Errors stem from missing prerequisites - diagnostic assessment needed to identify specific gaps.")
        elif error_cat == 'Application Error':
            insights.append("Student understands concepts but struggles to apply them - provide more worked examples.")
        elif error_cat == 'Precision/Attention':
            insights.append("Errors are careless rather than conceptual - encourage slowing down and double-checking.")

        return {
            'strategy': strategy,
            'priority': priority,
            'insights': insights
        }

    def _insufficient_data_response(self, user_id):
        """Return response when insufficient data for classification"""
        return {
            'student_id': user_id,
            'classification': {
                'capacity': 'Insufficient Data',
                'capacity_confidence': 0.0,
                'trajectory': 'Insufficient Data',
                'trajectory_confidence': 0.0,
                'primary_error_pattern': 'Insufficient Data',
                'error_confidence': 0.0
            },
            'detailed_analysis': {
                'capacity_evidence': {'message': 'Need at least 3 quiz sessions for analysis'},
                'trajectory_data': [],
                'error_examples': []
            },
            'recommended_intervention': 'Complete more quizzes to enable personalized analysis and recommendations.',
            'intervention_priority': 'low',
            'actionable_insights': [
                'Student needs to complete at least 3 quizzes for meaningful analysis.',
                'Encourage consistent practice to build sufficient data for personalized insights.'
            ]
        }
