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

async checkConnection() {
  const result = await this.checkConnectionDetails();
  return result.status === 'success';
}
