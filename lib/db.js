import { supabase } from './supabase';

class Database {
  async checkConnection() {
    const result = await this.checkConnectionDetails();
    return result.status === 'success';
  }

  async checkConnectionDetails() {
    try {
      console.log('Checking connection...');
      console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('Time:', new Date().toISOString());
      
      const { data, error } = await supabase
        .from('subjects')
        .select('count')
        .limit(1);

      if (error) {
        console.error('Connection error:', error);
        return {
          status: 'error',
          message: error.message,
          details: {
            code: error.code,
            hint: error.hint,
            time: new Date().toISOString(),
            url: process.env.NEXT_PUBLIC_SUPABASE_URL
          }
        };
      }

      return {
        status: 'success',
        time: new Date().toISOString(),
        user: 'MOLOORD232'
      };
    } catch (error) {
      console.error('Unexpected error:', error);
      return {
        status: 'error',
        message: 'Unexpected error occurred',
        error: error.message,
        time: new Date().toISOString()
      };
    }
  }

  async getSubjectsWithQuizzes() {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching subjects:', error);
      throw error;
    }
  }

  async getQuizWithQuestions(quizId) {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          *,
          questions (*)
        `)
        .eq('id', quizId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching quiz:', error);
      throw error;
    }
  }
}

export const db = new Database();
