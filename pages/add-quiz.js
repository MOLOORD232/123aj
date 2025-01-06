import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Plus, ArrowRight } from 'lucide-react';

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

// Input Component جديد
const Input = ({ label, ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      {...props}
    />
  </div>
);

export default function AddQuiz() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    subject: '',
    quizName: '',
    questions: ''
  });
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    // تحميل المواد المحفوظة مسبقاً
    const savedSubjects = localStorage.getItem('subjects');
    if (savedSubjects) {
      setSubjects(JSON.parse(savedSubjects));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // التحقق من وجود البيانات المطلوبة
    if (!formData.subject.trim() || !formData.quizName.trim() || !formData.questions.trim()) {
      alert('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    // تحميل البيانات الحالية من localStorage
    let subjects = JSON.parse(localStorage.getItem('subjects') || '[]');
    
    // البحث عن المادة
    let subject = subjects.find(s => s.name === formData.subject);
    
    // إنشاء كائن الاختبار الجديد
    const newQuiz = {
      id: Date.now().toString(),
      name: formData.quizName,
      questions: parseQuestions(formData.questions),
      createdAt: new Date().toISOString()
    };

    if (subject) {
      // إضافة الاختبار للمادة الموجودة
      subject.quizzes.push(newQuiz);
    } else {
      // إنشاء مادة جديدة مع الاختبار
      subject = {
        id: Date.now().toString(),
        name: formData.subject,
        quizzes: [newQuiz]
      };
      subjects.push(subject);
    }

    // حفظ التغييرات
    localStorage.setItem('subjects', JSON.stringify(subjects));
    
    // إعادة التوجيه للصفحة الرئيسية
    router.push('/');
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
        correctAnswer,
        selectedAnswer: ''
      };
    });
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
                  className="w-full h-60 p-3 border rounded-lg shadow-sm text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1. نص السؤال الأول
a) الخيار الأول
b) الخيار الثاني
c) الخيار الثالث
d) الخيار الرابع
Answer: a"
                  dir="ltr"
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                <Plus className="w-4 h-4 ml-2" />
                إضافة الاختبار
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
