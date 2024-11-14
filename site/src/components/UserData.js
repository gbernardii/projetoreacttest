import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserContainer = styled.div`
  padding: 20px;
  text-align: center;
  color: #004f42;
  min-height: 100vh;
  background: #f4f4f9;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: #2c3e50;
`;

const UserInfo = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  padding: 20px;
  margin: 10px auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 500px;
`;

const InfoRow = styled.p`
  font-size: 1.2rem;
  color: #333;
  margin: 10px 0;

  strong {
    font-weight: 600;
    color: #004f42;
  }
`;

const LogoutButton = styled.button`
  background-color: #ff4d4f;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 20px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #d9363e;
  }
`;

const ActionButton = styled.button`
  background-color: #004f42;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  margin: 10px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #00352f;
  }
`;

const UserData = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3001/usuario', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Erro ao buscar informações do usuário:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    navigate('/login');
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:3001/usuario',
        { nome: user.nome, email: user.email, telefone: user.telefone, data_nasc: user.data_nasc },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Dados atualizados com sucesso!");
      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao atualizar dados do usuário:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.")) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete('http://localhost:3001/usuario', {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Conta excluída com sucesso.");
        handleLogout(); 
      } catch (error) {
        console.error("Erro ao excluir usuário:", error);
      }
    }
  };

  const handleDeleteQuiz = async () => {
    if (window.confirm("Tem certeza que deseja excluir o resultado do seu quiz? Esta ação não pode ser desfeita.")) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete('http://localhost:3001/usuario/quiz', {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Resultado do quiz excluído com sucesso.");
        setUser((prevUser) => ({ ...prevUser, perfil_calculado: null }));
      } catch (error) {
        console.error("Erro ao excluir resultado do quiz:", error);
      }
    }
  };

  if (loading) {
    return <UserContainer>Carregando informações do usuário...</UserContainer>;
  }

  if (!user) {
    return <UserContainer>Nenhum usuário encontrado.</UserContainer>;
  }

  return (
    <UserContainer>
      <Title>Informações do Usuário</Title>
      <UserInfo>
        {isEditing ? (
          <>
            <input type="text" value={user.nome} onChange={(e) => setUser({ ...user, nome: e.target.value })} />
            <input type="email" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} />
            <input type="tel" value={user.telefone} onChange={(e) => setUser({ ...user, telefone: e.target.value })} />
            <input type="date" value={user.data_nasc} onChange={(e) => setUser({ ...user, data_nasc: e.target.value })} />
            <ActionButton onClick={handleUpdate}>Salvar Alterações</ActionButton>
            <ActionButton onClick={() => setIsEditing(false)}>Cancelar</ActionButton>
          </>
        ) : (
          <>
            <InfoRow><strong>Nome:</strong> {user.nome}</InfoRow>
            <InfoRow><strong>Email:</strong> {user.email}</InfoRow>
            <InfoRow><strong>Telefone:</strong> {user.telefone || 'Não informado'}</InfoRow>
            <InfoRow><strong>Data de Nascimento:</strong> {user.data_nasc ? new Date(user.data_nasc).toLocaleDateString() : 'Não informado'}</InfoRow>
            <InfoRow><strong>Perfil de Investidor:</strong> {user.perfil_calculado || 'Ainda não calculado'}</InfoRow>
            <ActionButton onClick={() => setIsEditing(true)}>Editar</ActionButton>
            {user.perfil_calculado && <ActionButton onClick={handleDeleteQuiz}>Excluir Resultado do Quiz</ActionButton>}
            <LogoutButton onClick={handleDelete}>Excluir Conta</LogoutButton>
          </>
          
        )}
      </UserInfo>
      <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
    </UserContainer>
  );
};

export default UserData;
