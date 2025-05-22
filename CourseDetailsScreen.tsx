import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import CourseService from '../services/course.service';
import CartService from '../services/cart.service';
import AuthService from '../services/auth.service';

/**
 * Tela de Detalhes do Curso
 * Exibe informações detalhadas sobre um curso específico
 * 
 * @returns {JSX.Element} Componente de tela de detalhes do curso
 */
const CourseDetailsScreen = ({ route, navigation }) => {
  // Obter ID do curso dos parâmetros da rota
  const { courseId } = route.params;

  // Estados para armazenar os dados
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar autenticação ao montar o componente
  useEffect(() => {
    setIsAuthenticated(AuthService.isAuthenticated());
  }, []);

  // Carregar detalhes do curso ao montar o componente
  useEffect(() => {
    loadCourseDetails();
  }, [courseId]);

  /**
   * Função para carregar detalhes do curso
   */
  const loadCourseDetails = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Em um app real, usaríamos:
      // const result = await CourseService.getCourseById(courseId);
      
      // Simulação de resposta da API para fins acadêmicos
      const mockCourse = {
        id: courseId,
        title: 'Desenvolvimento Web Completo',
        description: 'Aprenda desenvolvimento web do zero ao avançado com este curso completo que abrange HTML, CSS, JavaScript, Node.js, React e muito mais. Você aprenderá a criar websites responsivos, aplicações web interativas e APIs RESTful.',
        shortDescription: 'Do zero ao avançado em desenvolvimento web',
        thumbnail: 'https://example.com/web-dev.jpg',
        instructor: {
          id: '123',
          name: 'Maria Oliveira',
          profileImage: 'https://example.com/maria.jpg',
          bio: 'Desenvolvedora web com mais de 10 anos de experiência e especialista em tecnologias frontend e backend.'
        },
        price: 129.90,
        discountPrice: 0,
        category: {
          id: '2',
          name: 'Desenvolvimento Web'
        },
        level: 'intermediate',
        language: 'pt-BR',
        duration: 4200, // 70 horas em minutos
        averageRating: 4.8,
        totalReviews: 230,
        lessons: [
          {
            id: '1',
            title: 'Introdução ao HTML5',
            description: 'Fundamentos da linguagem de marcação',
            duration: 45,
            contentType: 'video',
            isPreview: true,
            order: 1
          },
          {
            id: '2',
            title: 'CSS3 Básico',
            description: 'Estilização de páginas web',
            duration: 60,
            contentType: 'video',
            isPreview: false,
            order: 2
          },
          {
            id: '3',
            title: 'JavaScript Fundamentos',
            description: 'Programação client-side',
            duration: 90,
            contentType: 'video',
            isPreview: false,
            order: 3
          }
        ],
        requirements: [
          'Conhecimentos básicos de informática',
          'Computador com acesso à internet',
          'Editor de código (recomendado: VS Code)'
        ],
        whatYouWillLearn: [
          'Criar websites responsivos com HTML5 e CSS3',
          'Desenvolver aplicações interativas com JavaScript',
          'Construir APIs RESTful com Node.js',
          'Criar interfaces modernas com React',
          'Implementar bancos de dados SQL e NoSQL'
        ]
      };

      const result = {
        success: true,
        data: mockCourse
      };

      if (result.success) {
        setCourse(result.data);
      } else {
        setError(result.error?.message || 'Erro ao carregar detalhes do curso');
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do curso:', error);
      setError('Ocorreu um erro ao carregar os detalhes do curso. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Função para adicionar curso ao carrinho
   */
  const handleAddToCart = async () => {
    // Verificar se o usuário está autenticado
    if (!isAuthenticated) {
      Alert.alert(
        'Autenticação necessária',
        'Você precisa fazer login para adicionar cursos ao carrinho.',
        [
          {
            text: 'Cancelar',
            style: 'cancel'
          },
          {
            text: 'Fazer login',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
      return;
    }

    try {
      setIsAddingToCart(true);

      // Em um app real, usaríamos:
      // const result = await CartService.addToCart(courseId);
      
      // Simulação de resposta da API para fins acadêmicos
      const result = {
        success: true,
        data: {
          message: 'Curso adicionado ao carrinho com sucesso'
        }
      };

      if (result.success) {
        Alert.alert(
          'Sucesso',
          'Curso adicionado ao carrinho com sucesso!',
          [
            {
              text: 'Continuar comprando',
              style: 'cancel'
            },
            {
              text: 'Ver carrinho',
              onPress: () => navigation.navigate('Cart')
            }
          ]
        );
      } else {
        Alert.alert('Erro', result.error?.message || 'Erro ao adicionar curso ao carrinho');
      }
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao adicionar o curso ao carrinho. Tente novamente.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  /**
   * Função para formatar a duração em horas e minutos
   * @param {number} minutes - Duração em minutos
   * @returns {string} Duração formatada
   */
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}min`;
    } else if (hours > 0) {
      return `${hours} hora${hours > 1 ? 's' : ''}`;
    } else {
      return `${mins} minuto${mins > 1 ? 's' : ''}`;
    }
  };

  // Renderizar tela de carregamento
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Carregando detalhes do curso...</Text>
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
          onPress={loadCourseDetails}
        >
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Renderizar detalhes do curso
  return (
    <ScrollView style={styles.container}>
      {/* Thumbnail do curso */}
      <Image
        source={{ uri: course.thumbnail }}
        style={styles.thumbnail}
        defaultSource={require('../assets/course-placeholder.png')}
      />

      {/* Informações básicas */}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{course.title}</Text>
        <Text style={styles.shortDescription}>{course.shortDescription}</Text>

        <View style={styles.metaContainer}>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>★ {course.averageRating.toFixed(1)}</Text>
            <Text style={styles.reviews}>({course.totalReviews} avaliações)</Text>
          </View>
          
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryLabel}>Categoria:</Text>
            <Text style={styles.categoryName}>{course.category.name}</Text>
          </View>
        </View>

        <View style={styles.instructorContainer}>
          <Image
            source={{ uri: course.instructor.profileImage }}
            style={styles.instructorImage}
            defaultSource={require('../assets/avatar-placeholder.png')}
          />
          <View style={styles.instructorInfo}>
            <Text style={styles.instructorLabel}>Instrutor:</Text>
            <Text style={styles.instructorName}>{course.instructor.name}</Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Nível:</Text>
            <Text style={styles.detailValue}>
              {course.level === 'beginner' ? 'Iniciante' : 
               course.level === 'intermediate' ? 'Intermediário' : 'Avançado'}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Idioma:</Text>
            <Text style={styles.detailValue}>
              {course.language === 'pt-BR' ? 'Português' : course.language}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Duração:</Text>
            <Text style={styles.detailValue}>{formatDuration(course.duration)}</Text>
          </View>
        </View>

        {/* Preço e botão de compra */}
        <View style={styles.priceContainer}>
          {course.discountPrice > 0 ? (
            <>
              <Text style={styles.originalPrice}>
                R$ {course.price.toFixed(2)}
              </Text>
              <Text style={styles.discountPrice}>
                R$ {course.discountPrice.toFixed(2)}
              </Text>
            </>
          ) : (
            <Text style={styles.price}>
              R$ {course.price.toFixed(2)}
            </Text>
          )}
          
          <TouchableOpacity
            style={[styles.addToCartButton, isAddingToCart && styles.addToCartButtonDisabled]}
            onPress={handleAddToCart}
            disabled={isAddingToCart}
          >
            <Text style={styles.addToCartButtonText}>
              {isAddingToCart ? 'Adicionando...' : 'Adicionar ao carrinho'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Descrição do curso */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Descrição</Text>
        <Text style={styles.description}>{course.description}</Text>
      </View>

      {/* O que você aprenderá */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>O que você aprenderá</Text>
        {course.whatYouWillLearn.map((item, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.listItemBullet}>•</Text>
            <Text style={styles.listItemText}>{item}</Text>
          </View>
        ))}
      </View>

      {/* Requisitos */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Requisitos</Text>
        {course.requirements.map((item, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.listItemBullet}>•</Text>
            <Text style={styles.listItemText}>{item}</Text>
          </View>
        ))}
      </View>

      {/* Conteúdo do curso */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Conteúdo do curso</Text>
        <Text style={styles.lessonCount}>
          {course.lessons.length} aula{course.lessons.length !== 1 ? 's' : ''}
        </Text>
        
        {course.lessons.map((lesson, index) => (
          <View key={lesson.id} style={styles.lessonItem}>
            <View style={styles.lessonHeader}>
              <Text style={styles.lessonNumber}>{index + 1}.</Text>
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
              {lesson.isPreview && (
                <View style={styles.previewBadge}>
                  <Text style={styles.previewText}>Prévia</Text>
                </View>
              )}
            </View>
            <Text style={styles.lessonDescription}>{lesson.description}</Text>
            <Text style={styles.lessonDuration}>{lesson.duration} min</Text>
          </View>
        ))}
      </View>

      {/* Sobre o instrutor */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Sobre o instrutor</Text>
        <View style={styles.instructorDetailContainer}>
          <Image
            source={{ uri: course.instructor.profileImage }}
            style={styles.instructorDetailImage}
            defaultSource={require('../assets/avatar-placeholder.png')}
          />
          <View style={styles.instructorDetailInfo}>
            <Text style={styles.instructorDetailName}>{course.instructor.name}</Text>
            <Text style={styles.instructorBio}>{course.instructor.bio}</Text>
          </View>
        </View>
      </View>

      {/* Botão de ver avaliações */}
      <TouchableOpacity
        style={styles.reviewsButton}
        onPress={() => navigation.navigate('CourseReviews', { courseId: course.id })}
      >
        <Text style={styles.reviewsButtonText}>
          Ver todas as avaliações ({course.totalReviews})
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Estilos do componente
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  thumbnail: {
    width: '100%',
    height: 200,
  },
  infoContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  shortDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 4,
  },
  reviews: {
    color: '#666',
    fontSize: 14,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryLabel: {
    color: '#666',
    fontSize: 14,
    marginRight: 4,
  },
  categoryName: {
    color: '#333',
    fontSize: 14,
    fontWeight: 'bold',
  },
  instructorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  instructorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  instructorInfo: {
    flex: 1,
  },
  instructorLabel: {
    color: '#666',
    fontSize: 14,
  },
  instructorName: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
  },
  detailValue: {
    color: '#333',
    fontSize: 14,
    fontWeight: 'bold',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  price: {
 
(Content truncated due to size limit. Use line ranges to read in chunks)