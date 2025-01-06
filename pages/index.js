// pages/index.js
import React, { useState, useEffect } from 'react';
import { Plus, Book, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/router';

// Button Component
const Button = ({ className = '', children, ...props }) => (
  <button
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-500 text-white hover:bg-blue-600 h-10 px-4 py-2 ${className}`}
    {...props}
  >
    {children}
  </button>
);

// Card Component
const Card = ({ className = '', ...props }) => (
  <div
    className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}
    {...props}
  />
);

export default function QuizApp() {
  const router = useRouter();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    // تحميل المواد من localStorage
    const savedSubjects = localStorage.getItem('subjects');
    if (savedSubjects) {
      setSubjects(JSON.parse(savedSubjects));
    }
  }, []);

  const handleAnswerSelect = (questionIndex, answer) => {
    setQuestions(prevQuestions => {
      const newQuestions = [...prevQuestions];
      newQuestions[questionIndex] = {
        ...newQuestions[questionIndex],
        selectedAnswer: answer
      };
      return newQuestions;
    });
  };

  const shareQuiz = () => {
    if (!questions.length) return;
    
    const quizText = questions.map((q, i) => {
      const optionsText = q.options.map(opt => 
        `${opt.letter}) ${opt.text}`
      ).join('\n');
      return `${i + 1}. ${q.question}\n${optionsText}\nAnswer: ${q.correctAnswer}`;
    }).join('\n\n');
    
    navigator.clipboard.writeText(quizText);
    alert('تم نسخ الاختبار! يمكنك لصقه وإرساله لأصدقائك');
  };

  const selectSubject = (subject) => {
    setSelectedSubject(subject);
    setSelectedQuiz(null);
    setQuestions([]);
  };

  const selectQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setQuestions(quiz.questions);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {selectedSubject && (
              <button 
                onClick={() => selectSubject(null)} 
                className="text-gray-600 hover:text-gray-800"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-lg font-semibold">
              {selectedSubject ? selectedSubject.name : 'المواد الدراسية'}
            </h1>
          </div>
          <Button onClick={() => router.push('/add-quiz')} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            اختبار جديد
          </Button>
        </div>
      </div>

      <div className="pt-16 pb-6">
        <div className="max-w-4xl mx-auto px-4">
          {!selectedSubject ? (
            // عرض قائمة المواد
            <div className="grid gap-4 md:grid-cols-2">
              {subjects.map((subject) => (
                <Card 
                  key={subject.id}
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => selectSubject(subject)}
                >
                  <div className="flex items-center gap-3">
                    <Book className="w-5 h-5 text-blue-500" />
                    <div>
                      <h2 className="font-semibold">{subject.name}</h2>
                      <p className="text-sm text-gray-600">
                        {subject.quizzes.length} اختبارات
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : !selectedQuiz ? (
            // عرض قائمة الاختبارات في المادة المحددة
            <div className="grid gap-4 md:grid-cols-2">
              {selectedSubject.quizzes.map((quiz) => (
                <Card 
                  key={quiz.id}
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => selectQuiz(quiz)}
                >
                  <h2 className="font-semibold mb-2">{quiz.name}</h2>
                  <p className="text-sm text-gray-600">
                    {quiz.questions.length} أسئلة
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(quiz.createdAt).toLocaleDateString('ar-EG')}
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            // عرض الاختبار المحدد
            <>
              <div className="mb-4 flex justify-between items-center">
                <h2 className="font-semibold text-xl">{selectedQuiz.name}</h2>
                <Button onClick={shareQuiz}>مشاركة</Button>
              </div>
              
              <div className="space-y-4">
                {questions.map((question, questionIndex) => (
                  <Card key={questionIndex} className="p-4">
                    <div className="mb-4 text-base md:text-lg font-medium">
                      {question.question}
                    </div>
                    <div className="space-y-3">
                      {question.options.map((option) => {
                        const isSelected = question.selectedAnswer === option.letter;
                        const isCorrect = question.correctAnswer === option.letter;
                        const showResult = question.selectedAnswer !== '';
                        
                        let bgColor = 'bg-white';
                        if (showResult && isSelected) {
                          bgColor = isCorrect ? 'bg-green-50' : 'bg-red-50';
                        }
                        
                        return (
                          <div
                            key={option.letter}
                            onClick={() => handleAnswerSelect(questionIndex, option.letter)}
                            className={`p-3 border rounded-lg cursor-pointer ${bgColor} 
                              hover:bg-gray-50 transition-colors`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="min-w-[24px] font-medium">
                                {option.letter})
                              </div>
                              <div>{option.text}</div>
                              {showResult && isSelected && (
                                <div className="mr-auto">
                                  {isCorrect ? 
                                    <span className="text-green-600 text-xl">✓</span> : 
                                    <span className="text-red-600 text-xl">✗</span>
                                  }
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {question.selectedAnswer && 
                     question.selectedAnswer !== question.correctAnswer && (
                      <div className="mt-4 text-sm text-red-600 p-2 bg-red-50 rounded-lg">
                        الإجابة الصحيحة هي: {question.correctAnswer}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
