import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import UserService from '../services/user.service';
import CourseService from '../services/course.service';
import AuthService from '../services/auth.service';

/**
 * Tela de Painel Administrativo
 * Permite que administradores gerenciem cursos, usuários e a plataforma
 * 
 * @returns {JSX.Element} Componente de tela do painel administrativo
 */
const AdminDashboardScreen = ({ navigation }) => {
  // Estados para armazenar os dados
  const [activeTab, setActiveTab] = useState('courses'); // 'courses', 'users', 'stats'
  const [pendingCourses, setPendingCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalRevenue: 0,
    activeStudents: 0,
    activeTeachers: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Verificar autenticação e carregar dados ao montar o componente
  useEffect(() => {
    // Verificar se o usuário está autenticado e é administrador
    const user = AuthService.getCurrentUser();
    if (!user || user.role !== 'admin') {
      Alert.alert(
        'Acesso negado',
        'Esta área é exclusiva para administradores.',
        [
          {
            text: 'OK',
            onPress: () => navigation.replace('Home')
          }
        ]
      );
      return;
    }

    loadAdminData();
  }, []);

  /**
   * Função para carregar dados do painel administrativo
   */
  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Em um app real, usaríamos:
      // const statsResult = await UserService.getAdminStats();
      // const pendingCoursesResult = await CourseService.getPendingCourses();
      // const usersResult = await UserService.getAllUsers();
      
      // Simulação de resposta da API para fins acadêmicos
      const mockStats = {
        totalUsers: 1250,
        totalCourses: 85,
        totalRevenue: 45750.80,
        activeStudents: 980,
        activeTeachers: 45
      };

      const mockPendingCourses = [
        {
          id: '1',
          title: 'Introdução à Inteligência Artificial',
          thumbnail: 'https://example.com/ai.jpg',
          instructor: {
            id: '123',
            name: 'Carlos Mendes'
          },
          price: 149.90,
          createdAt: '2025-05-10T09:45:00Z',
          status: 'pending'
        },
        {
          id: '2',
          title: 'Marketing Digital para Iniciantes',
          thumbnail: 'https://example.com/marketing.jpg',
          instructor: {
            id: '456',
            name: 'Ana Silva'
          },
          price: 89.90,
          createdAt: '2025-05-12T14:30:00Z',
          status: 'pending'
        }
      ];

      const mockUsers = [
        {
          id: '123',
          name: 'Carlos Mendes',
          email: 'carlos@example.com',
          role: 'teacher',
          createdAt: '2025-01-15T10:30:00Z',
          status: 'active',
          coursesCreated: 5,
          revenue: 3450.75
        },
        {
          id: '456',
          name: 'Ana Silva',
          email: 'ana@example.com',
          role: 'teacher',
          createdAt: '2025-02-20T14:15:00Z',
          status: 'active',
          coursesCreated: 3,
          revenue: 1890.50
        },
        {
          id: '789',
          name: 'João Oliveira',
          email: 'joao@example.com',
          role: 'student',
          createdAt: '2025-03-10T09:45:00Z',
          status: 'active',
          coursesEnrolled: 4,
          totalSpent: 349.70
        }
      ];

      const statsResult = {
        success: true,
        data: mockStats
      };

      const pendingCoursesResult = {
        success: true,
        data: mockPendingCourses
      };

      const usersResult = {
        success: true,
        data: mockUsers
      };

      if (statsResult.success && pendingCoursesResult.success && usersResult.success) {
        setStats(statsResult.data);
        setPendingCourses(pendingCoursesResult.data);
        setUsers(usersResult.data);
      } else {
        setError(statsResult.error?.message || pendingCoursesResult.error?.message || usersResult.error?.message || 'Erro ao carregar dados');
      }
    } catch (error) {
      console.error('Erro ao carregar dados administrativos:', error);
      setError('Ocorreu um erro ao carregar os dados administrativos. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Função para aprovar curso
   * @param {string} courseId - ID do curso a ser aprovado
   */
  const handleApproveCourse = async (courseId) => {
    try {
      setIsLoading(true);

      // Em um app real, usaríamos:
      // const result = await CourseService.approveCourse(courseId);
      
      // Simulação de resposta da API para fins acadêmicos
      const result = {
        success: true,
        data: {
          message: 'Curso aprovado com sucesso'
        }
      };

      if (result.success) {
        // Atualizar estado local
        setPendingCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));
        
        // Exibir mensagem de sucesso
        Alert.alert('Sucesso', 'Curso aprovado com sucesso!');
      } else {
        Alert.alert('Erro', result.error?.message || 'Erro ao aprovar curso');
      }
    } catch (error) {
      console.error('Erro ao aprovar curso:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao aprovar o curso. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Função para rejeitar curso
   * @param {string} courseId - ID do curso a ser rejeitado
   */
  const handleRejectCourse = async (courseId) => {
    // Solicitar motivo da rejeição
    Alert.prompt(
      'Rejeitar curso',
      'Por favor, informe o motivo da rejeição:',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Rejeitar',
          onPress: async (reason) => {
            if (!reason || !reason.trim()) {
              Alert.alert('Erro', 'É necessário informar um motivo para a rejeição.');
              return;
            }
            
            try {
              setIsLoading(true);

              // Em um app real, usaríamos:
              // const result = await CourseService.rejectCourse(courseId, { reason });
              
              // Simulação de resposta da API para fins acadêmicos
              const result = {
                success: true,
                data: {
                  message: 'Curso rejeitado com sucesso'
                }
              };

              if (result.success) {
                // Atualizar estado local
                setPendingCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));
                
                // Exibir mensagem de sucesso
                Alert.alert('Sucesso', 'Curso rejeitado com sucesso!');
              } else {
                Alert.alert('Erro', result.error?.message || 'Erro ao rejeitar curso');
              }
            } catch (error) {
              console.error('Erro ao rejeitar curso:', error);
              Alert.alert('Erro', 'Ocorreu um erro ao rejeitar o curso. Tente novamente.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ],
      'plain-text'
    );
  };

  /**
   * Função para alterar status do usuário
   * @param {string} userId - ID do usuário
   * @param {string} newStatus - Novo status ('active' ou 'inactive')
   */
  const handleChangeUserStatus = async (userId, newStatus) => {
    try {
      setIsLoading(true);

      // Em um app real, usaríamos:
      // const result = await UserService.updateUserStatus(userId, { status: newStatus });
      
      // Simulação de resposta da API para fins acadêmicos
      const result = {
        success: true,
        data: {
          message: `Usuário ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso`
        }
      };

      if (result.success) {
        // Atualizar estado local
        setUsers(prevUsers => prevUsers.map(user => {
          if (user.id === userId) {
            return { ...user, status: newStatus };
          }
          return user;
        }));
        
        // Exibir mensagem de sucesso
        Alert.alert('Sucesso', `Usuário ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso!`);
      } else {
        Alert.alert('Erro', result.error?.message || 'Erro ao atualizar status do usuário');
      }
    } catch (error) {
      console.error('Erro ao atualizar status do usuário:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao atualizar o status do usuário. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Função para filtrar usuários com base na pesquisa
   * @returns {Array} Lista de usuários filtrados
   */
  const getFilteredUsers = () => {
    if (!searchQuery.trim()) {
      return users;
    }
    
    const query = searchQuery.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(query) || 
      user.email.toLowerCase().includes(query)
    );
  };

  /**
   * Função para renderizar um item da lista de cursos pendentes
   */
  const renderPendingCourseItem = ({ item }) => (
    <View style={styles.courseItem}>
      <Image
        source={{ uri: item.thumbnail }}
        style={styles.courseThumbnail}
        defaultSource={require('../assets/course-placeholder.png')}
      />
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.instructorName}>
          {item.instructor.name}
        </Text>
        <Text style={styles.coursePrice}>
          R$ {item.price.toFixed(2)}
        </Text>
        <Text style={styles.courseDate}>
          Enviado em: {new Date(item.createdAt).toLocaleDateString('pt-BR')}
        </Text>
      </View>
      <View style={styles.courseActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => handleApproveCourse(item.id)}
        >
          <Text style={styles.approveButtonText}>Aprovar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={() => handleRejectCourse(item.id)}
        >
          <Text style={styles.rejectButtonText}>Rejeitar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('CourseDetails', { courseId: item.id })}
        >
          <Text style={styles.actionButtonText}>Ver detalhes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  /**
   * Função para renderizar um item da lista de usuários
   */
  const renderUserItem = ({ item }) => (
    <View style={styles.userItem}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>
        <View style={[
          styles.roleBadge,
          item.role === 'admin' ? styles.adminBadge :
          item.role === 'teacher' ? styles.teacherBadge :
          styles.studentBadge
        ]}>
          <Text style={styles.roleText}>
            {item.role === 'admin' ? 'Admin' :
             item.role === 'teacher' ? 'Professor' : 'Estudante'}
          </Text>
        </View>
      </View>
      
      <View style={styles.userDetails}>
        <View style={styles.userDetailItem}>
          <Text style={styles.userDetailLabel}>Status:</Text>
          <View style={[
            styles.statusBadge,
            item.status === 'active' ? styles.activeStatus : styles.inactiveStatus
          ]}>
            <Text style={styles.statusText}>
              {item.status === 'active' ? 'Ativo' : 'Inativo'}
            </Text>
          </View>
        </View>
        
        <View style={styles.userDetailItem}>
          <Text style={styles.userDetailLabel}>Cadastro:</Text>
          <Text style={styles.userDetailValue}>
            {new Date(item.createdAt).toLocaleDateString('pt-BR')}
          </Text>
        </View>
        
        {item.role === 'teacher' ? (
          <>
            <View style={styles.userDetailItem}>
              <Text style={styles.userDetailLabel}>Cursos criados:</Text>
              <Text style={styles.userDetailValue}>{item.coursesCreated}</Text>
            </View>
            <View style={styles.userDetailItem}>
              <Text style={styles.userDetailLabel}>Receita gerada:</Text>
              <Text style={styles.userDetailValue}>R$ {item.revenue.toFixed(2)}</Text>
            </View>
          </>
        ) : item.role === 'student' ? (
          <>
            <View style={styles.userDetailItem}>
              <Text style={styles.userDetailLabel}>Cursos matriculados:</Text>
              <Text style={styles.userDetailValue}>{item.coursesEnrolled}</Text>
            </View>
            <View style={styles.userDetailItem}>
              <Text style={styles.userDetailLabel}>Total gasto:</Text>
              <Text style={styles.userDetailValue}>R$ {item.totalSpent.toFixed(2)}</Text>
            </View>
          </>
        ) : null}
      </View>
      
      <View style={styles.userActions}>
        {item.status === 'active' ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.deactivateButton]}
            onPress={() => handleChangeUserStatus(item.id, 'inactive')}
          >
            <Text style={styles.deactivateButtonText}>Desativar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, styles.activateButton]}
            onPress={() => handleChangeUserStatus(item.id, 'active')}
          >
            <Text style={styles.activateButtonText}>Ativar</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('UserDetails', { userId: item.id })}
        >
          <Text style={styles.actionButtonText}>Ver detalhes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Renderizar tela de carregamento
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Carregando dados administrativos...</Text>
      </View>
    );
  }

  // Renderizar mensagem de erro
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadAdminData}
        >
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Painel Administrativo</Text>
      
      {/* Estatísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalUsers}</Text>
          <Text style={styles.statLabel}>Usuários</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalCourses}</Text>
          <Text style={styles.statLabel}>Cursos</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>R$ {stats.totalRevenue.toFixed(2)}</Text>
          <Text
(Content truncated due to size limit. Use line ranges to read in chunks)