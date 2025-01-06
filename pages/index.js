import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';

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
  const [inputText, setInputText] = useState('');
  const [questions, setQuestions] = useState([]);
  const [savedQuizzes, setSavedQuizzes] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('quizzes');
    if (saved) {
      setSavedQuizzes(JSON.parse(saved));
    }
  }, []);

  const parseQuestions = (text) => {
    const questionBlocks = text.split(/\d+\.\s/).filter(block => block.trim());
    
    return questionBlocks.map(block => {
      const lines = block.split('\n').filter(line => line.trim());
      const questionText = lines[0].trim();
      
      const options = [];
      const optionLetters = ['a', 'b', 'c', 'd'];
      
      let correctAnswer = '';
      
      lines.forEach(line => {
        optionLetters.forEach(letter => {
          const regex = new RegExp(`^${letter}\\)\\s(.+)`, 'i');
          const match = line.match(regex);
          if (match) {
            options.push({
              letter: letter.toUpperCase(),
              text: match[1].trim()
            });
          }
        });
        
        const answerMatch = line.match(/Answer:\s*([a-d])/i);
        if (answerMatch) {
          correctAnswer = answerMatch[1].toUpperCase();
        }
      });
      
      return {
        question: questionText,
        options,
        correctAnswer,
        selectedAnswer: '',
      };
    });
  };

  const handleTextInput = (e) => {
    const text = e.target.value;
    setInputText(text);
    if (text.trim()) {
      const parsedQuestions = parseQuestions(text);
      setQuestions(parsedQuestions);
    } else {
      setQuestions([]);
    }
  };

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

  const saveQuiz = () => {
    if (questions.length === 0) return;
    
    const newQuiz = {
      id: Date.now().toString(),
      title: `اختبار ${savedQuizzes.length + 1}`,
      questions: questions.map(q => ({...q, selectedAnswer: ''}))
    };

    const newQuizzes = [...savedQuizzes, newQuiz];
    setSavedQuizzes(newQuizzes);
    localStorage.setItem('quizzes', JSON.stringify(newQuizzes));
    setInputText('');
    setQuestions([]);
  };

  const shareQuiz = () => {
    if (questions.length === 0) return;
    
    const quizText = questions.map((q, i) => {
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
          <h1 className="text-lg font-semibold">اختبار تفاعلي</h1>
          <div className="flex gap-2">
            <Button onClick={shareQuiz} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              مشاركة
            </Button>
            {questions.length > 0 && (
              <Button onClick={saveQuiz} className="bg-green-500 hover:bg-green-600">
                حفظ
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="pt-16 pb-6">
        <div className="max-w-4xl mx-auto px-4">
          {/* Saved Quizzes */}
          {savedQuizzes.length > 0 && (
            <div className="mb-6 grid gap-4 md:grid-cols-2">
              {savedQuizzes.map((quiz) => (
                <Card key={quiz.id} className="p-4">
                  <h2 className="font-semibold mb-2">{quiz.title}</h2>
                  <p className="text-gray-600 mb-4">{quiz.questions.length} أسئلة</p>
                  <Button
                    onClick={() => {
                      setInputText('');
                      setQuestions(quiz.questions);
                    }}
                  >
                    تحميل الاختبار
                  </Button>
                </Card>
              ))}
            </div>
          )}

          {/* Input Area */}
          <Card className="p-4 mb-6">
            <textarea
              className="w-full h-40 p-3 border rounded-lg shadow-sm text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="الصق الأسئلة هنا..."
              value={inputText}
              onChange={handleTextInput}
              dir="ltr"
            />
          </Card>

          {/* Questions */}
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
        </div>
      </div>
    </div>
  );
}
