export const getErrorMessage = (error: any): string => {
  if (!error) return "Ocorreu um erro inesperado.";

  // Handle Supabase/PostgREST errors
  if (error.code) {
    switch (error.code) {
      case "23505":
        return "Este registro já existe (duplicado).";
      case "23503":
        return "Este registro não pode ser removido pois está sendo usado em outro lugar.";
      case "23502":
        return "Um ou mais campos obrigatórios estão ausentes.";
      case "42P01":
        return "Tabela não encontrada no banco de dados.";
      case "42501":
        return "Você não tem permissão para realizar esta ação.";
      case "PGRST116":
        return "Nenhum resultado encontrado.";
      default:
        break;
    }
  }

  // Handle Supabase Auth errors
  const message = error.message || (typeof error === 'string' ? error : "");
  
  if (message.includes("Invalid login credentials")) return "E-mail ou senha incorretos.";
  if (message.includes("Email not confirmed")) return "E-mail ainda não confirmado. Verifique seu e-mail.";
  if (message.includes("User already registered")) return "Este e-mail já está cadastrado.";
  if (message.includes("Password should be at least")) return "A senha deve ter pelo menos 6 caracteres.";
  if (message.includes("Failed to fetch")) return "Falha na conexão com o servidor. Verifique sua internet.";
  if (message.includes("JWT expired")) return "Sua sessão expirou. Por favor, faça login novamente.";
  if (message.includes("Database error saving profile")) return "Erro ao salvar perfil. Tente novamente mais tarde.";

  // Default behavior
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  return "Ocorreu um erro ao processar sua solicitação.";
};

