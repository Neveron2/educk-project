import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert } from 'react-native';
import UserService from '../services/user.service';
import CourseService from '../services/course.service';
import AuthService from '../services/auth.service';

/**
 * Tela de Área do Professor
 * Permite que professores gerenciem seus cursos e conteúdos
 * 
 * @returns {JSX.Element} Componente de tela da área do professor
 */
const TeacherDashboardScreen = ({ navigation }) => {
  // Estados para armazenar os dados
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    pendingReviews: 0
  });

  // Verificar autenticação e carregar dados ao montar o componente
  useEffect(() => {
    // Verificar se o usuário está autenticado e é professor
    const user = AuthService.getCurrentUser();
    if (!user || user.role !== 'teacher') {
      Alert.alert(
        'Acesso negado',
        'Esta área é exclusiva para professores.',
        [
          {
            text: 'OK',
            onPress: () => navigation.replace('Home')
          }
        ]
      );
      return;
    }

    loadTeacherData();
  }, []);

  /**
   * Função para carregar dados do professor
   */
  const loadTeacherData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Em um app real, usaríamos:
      // const dashboardResult = await UserService.getTeacherDashboard();
      // const coursesResult = await CourseService.getCreatedCourses();
      
      // Simulação de resposta da API para fins acadêmicos
      const mockDashboard = {
        totalCourses: 5,
        totalStudents: 128,
        totalRevenue: 3450.75,
        pendingReviews: 3
      };

      const mockCourses = [
        {
          id: '1',
          title: 'Introdução ao React Native',
          thumbnail: 'https://example.com/react-native.jpg',
          price: 99.90,
          status: 'published',
          students: 45,
          averageRating: 4.5,
          totalRevenue: 1800.50,
          createdAt: '2025-03-15T10:30:00Z'
        },
        {
          id: '2',
          title: 'Desenvolvimento Web Completo',
          thumbnail: 'https://example.com/web-dev.jpg',
          price: 129.90,
          status: 'published',
          students: 83,
          averageRating: 4.8,
          totalRevenue: 1650.25,
          createdAt: '2025-02-20T14:15:00Z'
        },
        {
          id: '3',
          title: 'Introdução à Inteligência Artificial',
          thumbnail: 'https://example.com/ai.jpg',
          price: 149.90,
          status: 'draft',
          students: 0,
          averageRating: 0,
          totalRevenue: 0,
          createdAt: '2025-05-10T09:45:00Z'
        }
      ];

      const dashboardResult = {
        success: true,
        data: mockDashboard
      };

      const coursesResult = {
        success: true,
        data: mockCourses
      };

      if (dashboardResult.success && coursesResult.success) {
        setStats(dashboardResult.data);
        setCourses(coursesResult.data);
      } else {
        setError(dashboardResult.error?.message || coursesResult.error?.message || 'Erro ao carregar dados');
      }
    } catch (error) {
      console.error('Erro ao carregar dados do professor:', error);
      setError('Ocorreu um erro ao carregar seus dados. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Função para criar novo curso
   */
  const handleCreateCourse = () => {
    navigation.navigate('CreateCourse');
  };

  /**
   * Função para editar curso existente
   * @param {string} courseId - ID do curso a ser editado
   */
  const handleEditCourse = (courseId) => {
    navigation.navigate('EditCourse', { courseId });
  };

  /**
   * Função para gerenciar conteúdo do curso
   * @param {string} courseId - ID do curso
   */
  const handleManageContent = (courseId) => {
    navigation.navigate('ManageCourseContent', { courseId });
  };

  /**
   * Função para publicar curso
   * @param {string} courseId - ID do curso a ser publicado
   */
  const handlePublishCourse = async (courseId) => {
    try {
      setIsLoading(true);

      // Em um app real, usaríamos:
      // const result = await CourseService.publishCourse(courseId);
      
      // Simulação de resposta da API para fins acadêmicos
      const result = {
        success: true,
        data: {
          message: 'Curso enviado para aprovação com sucesso'
        }
      };

      if (result.success) {
        // Atualizar estado local
        const updatedCourses = courses.map(course => {
          if (course.id === courseId) {
            return { ...course, status: 'pending' };
          }
          return course;
        });
        
        setCourses(updatedCourses);
        
        // Exibir mensagem de sucesso
        Alert.alert('Sucesso', 'Curso enviado para aprovação com sucesso!');
      } else {
        Alert.alert('Erro', result.error?.message || 'Erro ao publicar curso');
      }
    } catch (error) {
      console.error('Erro ao publicar curso:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao publicar o curso. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Função para excluir curso
   * @param {string} courseId - ID do curso a ser excluído
   */
  const handleDeleteCourse = (courseId) => {
    // Confirmar exclusão
    Alert.alert(
      'Excluir curso',
      'Tem certeza que deseja excluir este curso? Esta ação não pode ser desfeita.',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);

              // Em um app real, usaríamos:
              // const result = await CourseService.deleteCourse(courseId);
              
              // Simulação de resposta da API para fins acadêmicos
              const result = {
                success: true,
                data: {
                  message: 'Curso excluído com sucesso'
                }
              };

              if (result.success) {
                // Atualizar estado local
                const updatedCourses = courses.filter(course => course.id !== courseId);
                setCourses(updatedCourses);
                
                // Atualizar estatísticas
                setStats(prev => ({
                  ...prev,
                  totalCourses: prev.totalCourses - 1
                }));
                
                // Exibir mensagem de sucesso
                Alert.alert('Sucesso', 'Curso excluído com sucesso!');
              } else {
                Alert.alert('Erro', result.error?.message || 'Erro ao excluir curso');
              }
            } catch (error) {
              console.error('Erro ao excluir curso:', error);
              Alert.alert('Erro', 'Ocorreu um erro ao excluir o curso. Tente novamente.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  /**
   * Função para renderizar um item da lista de cursos
   */
  const renderCourseItem = ({ item }) => (
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
        
        <View style={styles.courseMetaContainer}>
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Status:</Text>
            <View style={[
              styles.statusBadge,
              item.status === 'published' ? styles.statusPublished :
              item.status === 'pending' ? styles.statusPending :
              styles.statusDraft
            ]}>
              <Text style={styles.statusText}>
                {item.status === 'published' ? 'Publicado' :
                 item.status === 'pending' ? 'Em análise' :
                 item.status === 'rejected' ? 'Rejeitado' : 'Rascunho'}
              </Text>
            </View>
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              R$ {item.price.toFixed(2)}
            </Text>
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.students}</Text>
            <Text style={styles.statLabel}>Alunos</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {item.averageRating > 0 ? item.averageRating.toFixed(1) : '-'}
            </Text>
            <Text style={styles.statLabel}>Avaliação</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              R$ {item.totalRevenue.toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Receita</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditCourse(item.id)}
        >
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleManageContent(item.id)}
        >
          <Text style={styles.actionButtonText}>Conteúdo</Text>
        </TouchableOpacity>
        
        {item.status === 'draft' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.publishButton]}
            onPress={() => handlePublishCourse(item.id)}
          >
            <Text style={[styles.actionButtonText, styles.publishButtonText]}>Publicar</Text>
          </TouchableOpacity>
        )}
        
        {item.students === 0 && (
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteCourse(item.id)}
          >
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Excluir</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Renderizar tela de carregamento
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Carregando dados...</Text>
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
          onPress={loadTeacherData}
        >
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Painel do Professor</Text>
      
      {/* Estatísticas */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statCardValue}>{stats.totalCourses}</Text>
          <Text style={styles.statCardLabel}>Cursos</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statCardValue}>{stats.totalStudents}</Text>
          <Text style={styles.statCardLabel}>Alunos</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statCardValue}>R$ {stats.totalRevenue.toFixed(2)}</Text>
          <Text style={styles.statCardLabel}>Receita</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statCardValue}>{stats.pendingReviews}</Text>
          <Text style={styles.statCardLabel}>Avaliações</Text>
        </View>
      </View>
      
      {/* Botão de criar curso */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreateCourse}
      >
        <Text style={styles.createButtonText}>+ Criar novo curso</Text>
      </TouchableOpacity>
      
      {/* Lista de cursos */}
      <Text style={styles.sectionTitle}>Meus cursos</Text>
      
      {courses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Você ainda não criou nenhum curso. Clique no botão acima para criar seu primeiro curso.
          </Text>
        </View>
      ) : (
        <FlatList
          data={courses}
          renderItem={renderCourseItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.coursesList}
        />
      )}
    </View>
  );
};

// Estilos do componente
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    color: '#ff3b30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  statCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6C63FF',
    marginBottom: 4,
  },
  statCardLabel: {
    fontSize: 14,
    color: '#666',
  },
  createButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  emptyContainer: {
    padding: 24,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
  },
  coursesList: {
    paddingBottom: 16,
  },
  courseItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  courseThumbnail: {
    width: '100%',
    height: 150,
  },
  courseInfo: {
    padding: 16,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  courseMetaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusPublished: {
    backgroundColor: '#4CD964',
  },
  statusPending: {
    backgroundColor: '#FF9500',
  },
  statusDraft: {
    backgroundColor: '#8E8E93',
  },
  
(Content truncated due to size limit. Use line ranges to read in chunks)