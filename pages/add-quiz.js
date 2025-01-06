import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Plus, ArrowRight } from 'lucide-react';
import { db } from '../lib/db';

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

// Input Component
const Input = ({ label, error, ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        error ? 'border-red-500' : ''
      }`}
      {...props}
    />
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

export default function AddQuiz() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    quizName: '',
    questions: ''
  });
  const [errors, setErrors] = useState({});
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const loadedSubjects = await db.getSubjectsWithQuizzes();
      setSubjects(loadedSubjects);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // مسح رسالة الخطأ عند الكتابة
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.subject.trim()) {
      newErrors.subject = 'اسم المادة مطلوب';
    }

    if (!formData.quizName.trim()) {
      newErrors.quizName = 'اسم الاختبار مطلوب';
    }

    if (!formData.questions.trim()) {
      newErrors.questions = 'الأسئلة مطلوبة';
    } else {
      // التحقق من تنسيق الأسئلة
      const questionBlocks = formData.questions.split(/\d+\.\s/).filter(block => block.trim());
      for (const block of questionBlocks) {
        const lines = block.split('\n').filter(line => line.trim());
        if (lines.length < 6) { // سؤال + 4 خيارات + إجابة
          newErrors.questions = 'تنسيق الأسئلة غير صحيح';
          break;
        }
        if (!lines[lines.length - 1].match(/^Answer:\s*[a-dA-D]$/)) {
          newErrors.questions = 'يجب تحديد الإجابة الصحيحة بتنسيق Answer: a/b/c/d';
          break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
        correctAnswer
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // التحقق من وجود المادة أو إنشاء مادة جديدة
      let subject = subjects.find(s => s.name === formData.subject);
      if (!subject) {
        subject = await db.addSubject(formData.subject);
      }

      // إضافة الاختبار
      const parsedQuestions = parseQuestions(formData.questions);
      await db.addQuiz(subject.id, formData.quizName, parsedQuestions);

      router.push('/');
    } catch (error) {
      console.error('Error adding quiz:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'حدث خطأ أثناء حفظ الاختبار'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-lg font-semibold">إضافة اختبار جديد</h1>
          <Button onClick={() => router.push('/')} className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4" />
            عودة
          </Button>
        </div>
      </div>

      <div className="pt-20 pb-6">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="p-6">
            <form onSubmit={handleSubmit}>
              <Input
                label="اسم المادة"
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="مثال: الرياضيات"
                list="subjects"
                error={errors.subject}
                required
              />
              <datalist id="subjects">
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.name} />
                ))}
              </datalist>

              <Input
                label="اسم الاختبار"
                type="text"
                name="quizName"
                value={formData.quizName}
                onChange={handleInputChange}
                placeholder="مثال: اختبار الفصل الأول"
                error={errors.quizName}
                required
              />

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الأسئلة
                </label>
                <textarea
                  name="questions"
                  value={formData.questions}
                  onChange={handleInputChange}
                  className={`w-full h-60 p-3 border rounded-lg shadow-sm text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.questions ? 'border-red-500' : ''
                  }`}
                  placeholder="1. نص السؤال الأول
a) الخيار الأول
b) الخيار الثاني
c) الخيار الثالث
d) الخيار الرابع
Answer: a"
                  dir="ltr"
                  required
                />
                {errors.questions && (
                  <p className="mt-1 text-sm text-red-500">{errors.questions}</p>
                )}
              </div>

              {errors.submit && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-500">
                  {errors.submit}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    جاري الحفظ...
                  </span>
                ) : (
                  <>
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة الاختبار
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
