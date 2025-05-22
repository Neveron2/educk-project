import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import CourseService from '../services/course.service';
import CategoryService from '../services/category.service';

/**
 * Tela de Catálogo de Cursos
 * Exibe todos os cursos disponíveis na plataforma com opções de filtro e pesquisa
 * 
 * @returns {JSX.Element} Componente de tela de catálogo
 */
const CourseCatalogScreen = ({ navigation }) => {
  // Estados para armazenar os dados
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Carregar cursos ao montar o componente
  useEffect(() => {
    loadCategories();
    loadCourses();
  }, []);

  // Carregar cursos quando a categoria selecionada mudar
  useEffect(() => {
    setPage(1);
    setCourses([]);
    loadCourses(true);
  }, [selectedCategory]);

  /**
   * Função para carregar categorias
   */
  const loadCategories = async () => {
    try {
      // Aqui estou simulando o serviço de categorias, que seria implementado de forma similar aos outros
      const result = {
        success: true,
        data: [
          { id: '1', name: 'Programação' },
          { id: '2', name: 'Design' },
          { id: '3', name: 'Marketing' },
          { id: '4', name: 'Negócios' },
          { id: '5', name: 'Desenvolvimento Pessoal' }
        ]
      };

      if (result.success) {
        setCategories(result.data);
      } else {
        console.error('Erro ao carregar categorias:', result.error);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  /**
   * Função para carregar cursos
   * @param {boolean} refresh - Indica se é uma atualização (refresh)
   */
  const loadCourses = async (refresh = false) => {
    if (isLoading || (!hasMore && !refresh)) return;

    try {
      setIsLoading(true);
      setError('');

      // Definir parâmetros de busca
      const params = {
        page: refresh ? 1 : page,
        limit: 10
      };

      // Adicionar categoria se selecionada
      if (selectedCategory) {
        params.category = selectedCategory;
      }

      // Adicionar termo de pesquisa se existir
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      // Simular chamada ao serviço
      // Em um app real, usaríamos:
      // const result = await CourseService.getAllCourses(params);
      
      // Simulação de resposta da API para fins acadêmicos
      const mockCourses = [
        {
          id: '1',
          title: 'Introdução ao React Native',
          description: 'Aprenda a criar aplicativos móveis com React Native',
          thumbnail: 'https://example.com/react-native.jpg',
          instructor: { name: 'João Silva' },
          price: 99.90,
          discountPrice: 79.90,
          averageRating: 4.5,
          totalReviews: 120
        },
        {
          id: '2',
          title: 'Desenvolvimento Web Completo',
          description: 'HTML, CSS, JavaScript, Node.js e mais',
          thumbnail: 'https://example.com/web-dev.jpg',
          instructor: { name: 'Maria Oliveira' },
          price: 129.90,
          discountPrice: 0,
          averageRating: 4.8,
          totalReviews: 230
        },
        {
          id: '3',
          title: 'UX/UI Design para Iniciantes',
          description: 'Aprenda os fundamentos de design de interfaces',
          thumbnail: 'https://example.com/ux-ui.jpg',
          instructor: { name: 'Carlos Mendes' },
          price: 89.90,
          discountPrice: 69.90,
          averageRating: 4.2,
          totalReviews: 85
        }
      ];

      const result = {
        success: true,
        data: {
          courses: mockCourses,
          pagination: {
            total: 30,
            page: params.page,
            limit: params.limit,
            pages: 3
          }
        }
      };

      if (result.success) {
        const newCourses = result.data.courses;
        const pagination = result.data.pagination;

        // Atualizar estado dos cursos
        if (refresh) {
          setCourses(newCourses);
        } else {
          setCourses(prevCourses => [...prevCourses, ...newCourses]);
        }

        // Atualizar paginação
        setPage(pagination.page + 1);
        setHasMore(pagination.page < pagination.pages);
      } else {
        setError(result.error?.message || 'Erro ao carregar cursos');
      }
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
      setError('Ocorreu um erro ao carregar os cursos. Tente novamente.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Função para lidar com o refresh da lista
   */
  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadCourses(true);
  };

  /**
   * Função para lidar com o carregamento de mais cursos
   */
  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadCourses();
    }
  };

  /**
   * Função para lidar com a pesquisa
   */
  const handleSearch = () => {
    setPage(1);
    setCourses([]);
    loadCourses(true);
  };

  /**
   * Função para renderizar um item da lista de cursos
   */
  const renderCourseItem = ({ item }) => (
    <TouchableOpacity
      style={styles.courseItem}
      onPress={() => navigation.navigate('CourseDetails', { courseId: item.id })}
    >
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
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>★ {item.averageRating.toFixed(1)}</Text>
          <Text style={styles.reviews}>({item.totalReviews})</Text>
        </View>
        <View style={styles.priceContainer}>
          {item.discountPrice > 0 ? (
            <>
              <Text style={styles.originalPrice}>
                R$ {item.price.toFixed(2)}
              </Text>
              <Text style={styles.discountPrice}>
                R$ {item.discountPrice.toFixed(2)}
              </Text>
            </>
          ) : (
            <Text style={styles.price}>
              R$ {item.price.toFixed(2)}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  /**
   * Função para renderizar um item da lista de categorias
   */
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && styles.categoryItemSelected
      ]}
      onPress={() => setSelectedCategory(
        selectedCategory === item.id ? null : item.id
      )}
    >
      <Text
        style={[
          styles.categoryName,
          selectedCategory === item.id && styles.categoryNameSelected
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  /**
   * Função para renderizar o footer da lista
   */
  const renderFooter = () => {
    if (!isLoading) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#6C63FF" />
        <Text style={styles.loadingText}>Carregando mais cursos...</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Barra de pesquisa */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar cursos..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
        >
          <Text style={styles.searchButtonText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de categorias */}
      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesList}
        contentContainerStyle={styles.categoriesContent}
      />

      {/* Mensagem de erro */}
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}

      {/* Lista de cursos */}
      <FlatList
        data={courses}
        renderItem={renderCourseItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.coursesList}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={styles.emptyText}>
              Nenhum curso encontrado. Tente outros filtros.
            </Text>
          ) : null
        }
      />
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
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    padding: 12,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  categoriesList: {
    maxHeight: 50,
    marginBottom: 16,
  },
  categoriesContent: {
    paddingRight: 16,
  },
  categoryItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  categoryItemSelected: {
    backgroundColor: '#6C63FF',
  },
  categoryName: {
    color: '#333',
    fontSize: 14,
  },
  categoryNameSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  coursesList: {
    paddingBottom: 16,
  },
  courseItem: {
    flexDirection: 'row',
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
    width: 120,
    height: 120,
  },
  courseInfo: {
    flex: 1,
    padding: 12,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  instructorName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    color: '#FFD700',
    fontWeight: 'bold',
    marginRight: 4,
  },
  reviews: {
    color: '#666',
    fontSize: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6C63FF',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
  },
  errorText: {
    color: '#ff3b30',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 32,
  },
});

export default CourseCatalogScreen;
