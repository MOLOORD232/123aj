import { supabase } from './supabase';

class Database {
  constructor() {
    this.currentUser = 'MOLOORD232';
  }

  async checkConnection() {
    const result = await this.checkConnectionDetails();
    return result.status === 'success';
  }

  async checkConnectionDetails() {
    try {
      console.log('فحص الاتصال...');
      console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('Time:', new Date().toISOString());
      
      const { data, error } = await supabase
        .from('subjects')
        .select('count')
        .limit(1);

      if (error) {
        console.error('خطأ في الاتصال:', error);
        return {
          status: 'error',
          message: error.message,
          details: {
            code: error.code,
            hint: error.hint,
            time: new Date().toISOString(),
            url: process.env.NEXT_PUBLIC_SUPABASE_URL,
            user: this.currentUser
          }
        };
      }

      return {
        status: 'success',
        time: new Date().toISOString(),
        user: this.currentUser
      };
    } catch (error) {
      console.error('خطأ غير متوقع:', error);
      return {
        status: 'error',
        message: 'حدث خطأ غير متوقع',
        error: error.message,
        time: new Date().toISOString()
      };
    }
  }

  async getSubjectsWithQuizzes() {
    try {
      const { data: subjects, error: subjectsError } = await supabase
        .from('subjects')
        .select(`
          id,
          name,
          created_at,
          quizzes (
            id,
            name,
            created_at
          )
        `);

      if (subjectsError) throw subjectsError;

      return subjects || [];
    } catch (error) {
      console.error('خطأ في جلب المواد:', error);
      throw error;
    }
  }

  async getQuizWithQuestions(quizId) {
    try {
      // جلب الاختبار
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select(`
          id,
          name,
          created_at
        `)
        .eq('id', quizId)
        .single();

      if (quizError) throw quizError;

      // جلب الأسئلة مع خياراتها
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select(`
          id,
          question_text,
          correct_answer,
          options (
            id,
            letter,
            option_text
          )
        `)
        .eq('quiz_id', quizId);

      if (questionsError) throw questionsError;

      return {
        ...quiz,
        questions: questions.map(q => ({
          id: q.id,
          question: q.question_text,
          correctAnswer: q.correct_answer,
          options: q.options.sort((a, b) => a.letter.localeCompare(b.letter))
        }))
      };
    } catch (error) {
      console.error('خطأ في جلب الاختبار:', error);
      throw error;
    }
  }

  async addSubject(name) {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert([{ name }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('خطأ في إضافة المادة:', error);
      throw error;
    }
  }

  async addQuiz(subjectId, name) {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .insert([{
          subject_id: subjectId,
          name
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('خطأ في إضافة الاختبار:', error);
      throw error;
    }
  }

  async addQuestion(quizId, { question, options, correctAnswer }) {
    try {
      // إضافة السؤال أولاً
      const { data: questionData, error: questionError } = await supabase
        .from('questions')
        .insert([{
          quiz_id: quizId,
          question_text: question,
          correct_answer: correctAnswer
        }])
        .select()
        .single();

      if (questionError) throw questionError;

      // إضافة الخيارات
      const optionsToInsert = options.map((optionText, index) => ({
        question_id: questionData.id,
        letter: String.fromCharCode(65 + index), // A, B, C, D
        option_text: optionText
      }));

      const { error: optionsError } = await supabase
        .from('options')
        .insert(optionsToInsert);

      if (optionsError) throw optionsError;

      return questionData;
    } catch (error) {
      console.error('خطأ في إضافة السؤال:', error);
      throw error;
    }
  }
}

export const db = new Database();
