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
      const { data, error } = await supabase
        .from('subjects')
        .select(`
          *,
          quizzes (
            id,
            name,
            description,
            questions (count)
          )
        `);

      if (error) {
        console.error('خطأ في جلب المواد:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('خطأ في جلب المواد:', error);
      throw error;
    }
  }

  async getQuizWithQuestions(quizId) {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          *,
          questions (
            id,
            question,
            options,
            correct_answer
          )
        `)
        .eq('id', quizId)
        .single();

      if (error) {
        console.error('خطأ في جلب الاختبار:', error);
        throw error;
      }

      if (!data) {
        throw new Error('لم يتم العثور على الاختبار');
      }

      // تنسيق البيانات قبل إرجاعها
      return {
        ...data,
        questions: data.questions.map(q => ({
          ...q,
          options: Array.isArray(q.options) ? q.options : [],
          correctAnswer: q.correct_answer
        }))
      };
    } catch (error) {
      console.error('خطأ في جلب الاختبار:', error);
      throw error;
    }
  }

  async addSubject(name, description = '') {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert([{ name, description }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('خطأ في إضافة المادة:', error);
      throw error;
    }
  }

  async addQuiz(subjectId, name, description = '') {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .insert([{
          subject_id: subjectId,
          name,
          description
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

  async addQuestion(quizId, questionData) {
    try {
      const { data, error } = await supabase
        .from('questions')
        .insert([{
          quiz_id: quizId,
          question: questionData.question,
          options: questionData.options,
          correct_answer: questionData.correctAnswer
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('خطأ في إضافة السؤال:', error);
      throw error;
    }
  }
}

// تصدير نسخة واحدة من الكلاس
export const db = new Database();
