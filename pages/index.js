import React, { useState, useEffect } from 'react';
import { Plus, FolderOpen, ArrowLeft } from 'lucide-react';
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
  const [activeQuiz, setActiveQuiz] = useState(null);

  useEffect(() => {
    // تحميل المواد والاختبارات من localStorage
    const savedSubjects = localStorage.getItem('subjects');
    if (savedSubjects) {
      setSubjects(JSON.parse(savedSubjects));
    }
  }, []);

  const handleAnswerSelect = (questionIndex, answer) => {
    if (!activeQuiz) return;

    setActiveQuiz(prevQuiz => {
      const updatedQuiz = { ...prevQuiz };
      updatedQuiz.questions[questionIndex].selectedAnswer = answer;
      return updatedQuiz;
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const shareQuiz = (quiz) => {
    if (!quiz?.questions?.length) return;
    
    const quizText = quiz.questions.map((q, i) => {
      const optionsText = q.options.map(opt => 
        `${opt.letter}) ${opt.text}`
      ).join('\n');
      return `${i + 1}. ${q.question}\n${optionsText}\nAnswer: ${q.correctAnswer}`;
    }).join('\n\n');
    
    navigator.clipboard.writeText(quizText);
    alert('تم نسخ الاختبار! يمكنك لصقه وإرساله لأصدقائك');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-lg font-semibold">
            {activeQuiz ? activeQuiz.name :
             selectedSubject ? selectedSubject.name :
             'نظام الاختبارات'}
          </h1>
          <div className="flex gap-2">
            {!activeQuiz && (
              <Button onClick={() => router.push('/add-quiz')} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                اختبار جديد
              </Button>
            )}
            {(activeQuiz || selectedSubject) && (
              <Button 
                onClick={() => {
                  if (activeQuiz) {
                    setActiveQuiz(null);
                  } else {
                    setSelectedSubject(null);
                  }
                }}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                رجوع
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="pt-16 pb-6">
        <div className="max-w-4xl mx-auto px-4">
          {/* عرض الاختبار النشط */}
          {activeQuiz && (
            <div className="space-y-4">
              {activeQuiz.questions.map((question, questionIndex) => (
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
          )}

          {/* عرض اختبارات المادة المحددة */}
          {selectedSubject && !activeQuiz && (
            <div className="grid gap-4 md:grid-cols-2">
              {selectedSubject.quizzes.map((quiz) => (
                <Card key={quiz.id} className="p-4">
                  <h3 className="font-semibold mb-2">{quiz.name}</h3>
                  <p className="text-gray-600 mb-2">{quiz.questions.length} أسئلة</p>
                  <p className="text-gray-500 text-sm mb-4">
                    {formatDate(quiz.createdAt)}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setActiveQuiz(quiz)}
                      className="flex-1"
                    >
                      بدء الاختبار
                    </Button>
                    <Button
                      onClick={() => shareQuiz(quiz)}
                      className="bg-gray-500 hover:bg-gray-600"
                    >
                      مشاركة
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* عرض قائمة المواد */}
          {!selectedSubject && !activeQuiz && (
            <div className="grid gap-4 md:grid-cols-2">
              {subjects.map((subject) => (
                <Card 
                  key={subject.id} 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setSelectedSubject(subject)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FolderOpen className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{subject.name}</h3>
                      <p className="text-gray-600">
                        {subject.quizzes.length} اختبارات
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
