import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/router';

// Button Component (نفس المكون السابق)
const Button = ({ className = '', children, ...props }) => (
  <button
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-500 text-white hover:bg-blue-600 h-10 px-4 py-2 ${className}`}
    {...props}
  >
    {children}
  </button>
);

// Card Component (نفس المكون السابق)
const Card = ({ className = '', ...props }) => (
  <div
    className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}
    {...props}
  />
);

// Subject Card Component (مكون جديد)
const SubjectCard = ({ subject, onQuizSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="mb-4">
      <div 
        className="p-4 cursor-pointer flex items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-blue-500" />
          <div>
            <h3 className="font-semibold text-lg">{subject.name}</h3>
            <p className="text-sm text-gray-500">{subject.quizzes.length} اختبارات</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </div>

      {isExpanded && (
        <div className="border-t p-4">
          <div className="grid gap-3">
            {subject.quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => onQuizSelect(quiz)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{quiz.name}</h4>
                    <p className="text-sm text-gray-500">
                      {quiz.questions.length} أسئلة • {new Date(quiz.createdAt).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                  <Button 
                    className="text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuizSelect(quiz);
                    }}
                  >
                    بدء الاختبار
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default function QuizApp() {
  const router = useRouter();
  const [subjects, setSubjects] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);

  useEffect(() => {
    const savedSubjects = localStorage.getItem('subjects');
    if (savedSubjects) {
      setSubjects(JSON.parse(savedSubjects));
    }
  }, []);

  const handleAnswerSelect = (questionIndex, answer) => {
    if (!activeQuiz) return;

    setActiveQuiz(prev => {
      const updatedQuiz = { ...prev };
      updatedQuiz.questions[questionIndex].selectedAnswer = answer;
      return updatedQuiz;
    });
  };

  const handleQuizSelect = (quiz) => {
    // نسخ الاختبار مع إعادة تعيين الإجابات المحددة
    setActiveQuiz({
      ...quiz,
      questions: quiz.questions.map(q => ({
        ...q,
        selectedAnswer: ''
      }))
    });
  };

  const shareQuiz = () => {
    if (!activeQuiz) return;
    
    const quizText = activeQuiz.questions.map((q, i) => {
      const optionsText = q.options.map(opt => 
        `${opt.letter}) ${opt.text}`
      ).join('\n');
      return `${i + 1}. ${q.question}\n${optionsText}\nAnswer: ${q.correctAnswer}`;
    }).join('\n\n');
