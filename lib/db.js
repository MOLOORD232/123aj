import { supabase } from './supabase'

export const db = {
  // إضافة مادة جديدة
  async addSubject(name) {
    const { data, error } = await supabase
      .from('subjects')
      .insert([{ name }])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // إضافة اختبار جديد
  async addQuiz(subjectId, name, questions) {
    // إنشاء الاختبار
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert([{ subject_id: subjectId, name }])
      .select()
    
    if (quizError) throw quizError

    // إضافة الأسئلة
    for (const q of questions) {
      // إنشاء السؤال
      const { data: question, error: questionError } = await supabase
        .from('questions')
        .insert([{
          quiz_id: quiz[0].id,
          question_text: q.question,
          correct_answer: q.correctAnswer
        }])
        .select()
      
      if (questionError) throw questionError

      // إضافة الخيارات
      const options = q.options.map(opt => ({
        question_id: question[0].id,
        letter: opt.letter,
        option_text: opt.text
      }))

      const { error: optionsError } = await supabase
        .from('options')
        .insert(options)
      
      if (optionsError) throw optionsError
    }

    return quiz[0]
  },

  // جلب جميع المواد مع اختباراتها
  async getSubjectsWithQuizzes() {
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select(`
        *,
        quizzes (
          *
        )
      `)
      .order('created_at', { ascending: false })
    
    if (subjectsError) throw subjectsError
    return subjects
  },

  // جلب اختبار مع أسئلته وخياراته
  async getQuizWithQuestions(quizId) {
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select(`
        *,
        questions (
          *,
          options (*)
        )
      `)
      .eq('id', quizId)
      .single()
    
    if (quizError) throw quizError

    // تنسيق البيانات لتتوافق مع هيكل التطبيق
    return {
      ...quiz,
      questions: quiz.questions.map(q => ({
        question: q.question_text,
        correctAnswer: q.correct_answer,
        options: q.options.map(opt => ({
          letter: opt.letter,
          text: opt.option_text
        }))
      }))
    }
  }
}
