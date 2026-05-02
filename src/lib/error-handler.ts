export const getErrorMessage = (error: any): string => {
  if (!error) return "Ocorreu um erro inesperado.";

  // Handle Supabase/PostgREST errors
  if (error.code) {
    switch (error.code) {
      case "23505":
        return "Este registro já existe (duplicado).";
      case "23503":
        return "Este registro não pode ser removido pois está sendo usado em outro lugar.";
      case "42P01":
        return "Tabela não encontrada no banco de dados.";
      case "PGRST116":
        return "Nenhum resultado encontrado.";
      case "auth/invalid-email":
        return "E-mail inválido.";
      case "auth/user-not-found":
        return "Usuário não encontrado.";
      case "auth/wrong-password":
        return "Senha incorreta.";
      case "auth/email-already-in-use":
        return "Este e-mail já está em uso.";
      case "auth/weak-password":
        return "A senha é muito fraca.";
      case "auth/network-request-failed":
        return "Falha na conexão de rede.";
      default:
        // Try to return the message from the error object if it exists
        if (error.message) {
          if (error.message.includes("Failed to fetch")) return "Falha na conexão com o servidor.";
          if (error.message.includes("JWT expired")) return "Sua sessão expirou. Por favor, faça login novamente.";
          return error.message;
        }
    }
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    if (error.message.includes("Failed to fetch")) return "Falha na conexão com o servidor.";
    return error.message;
  }

  // Handle string errors
  if (typeof error === "string") return error;

  return "Ocorreu um erro ao processar sua solicitação.";
};
