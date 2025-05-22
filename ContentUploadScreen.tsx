import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import CourseService from '../services/course.service';
import AuthService from '../services/auth.service';

/**
 * Tela de Upload de Conteúdo
 * Permite que professores façam upload de conteúdo para seus cursos
 * 
 * @returns {JSX.Element} Componente de tela de upload de conteúdo
 */
const ContentUploadScreen = ({ route, navigation }) => {
  // Obter ID do curso dos parâmetros da rota
  const { courseId } = route.params;

  // Estados para armazenar os dados
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Estados para o formulário de nova aula
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState('video'); // 'video', 'document', 'quiz'
  const [duration, setDuration] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

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

    loadCourseData();
  }, [courseId]);

  /**
   * Função para carregar dados do curso
   */
  const loadCourseData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Em um app real, usaríamos:
      // const courseResult = await CourseService.getCourseById(courseId);
      
      // Simulação de resposta da API para fins acadêmicos
      const mockCourse = {
        id: courseId,
        title: 'Desenvolvimento Web Completo',
        thumbnail: 'https://example.com/web-dev.jpg',
        instructor: {
          id: '123',
          name: 'Maria Oliveira'
        },
        status: 'draft'
      };

      const mockLessons = [
        {
          id: '1',
          title: 'Introdução ao HTML5',
          description: 'Fundamentos da linguagem de marcação',
          duration: 45,
          contentType: 'video',
          isPreview: true,
          order: 1,
          content: 'https://example.com/videos/html5-intro.mp4'
        },
        {
          id: '2',
          title: 'CSS3 Básico',
          description: 'Estilização de páginas web',
          duration: 60,
          contentType: 'video',
          isPreview: false,
          order: 2,
          content: 'https://example.com/videos/css3-basics.mp4'
        }
      ];

      const courseResult = {
        success: true,
        data: mockCourse
      };

      const lessonsResult = {
        success: true,
        data: mockLessons
      };

      if (courseResult.success && lessonsResult.success) {
        setCourse(courseResult.data);
        setLessons(lessonsResult.data);
      } else {
        setError(courseResult.error?.message || lessonsResult.error?.message || 'Erro ao carregar dados do curso');
      }
    } catch (error) {
      console.error('Erro ao carregar dados do curso:', error);
      setError('Ocorreu um erro ao carregar os dados do curso. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Função para selecionar arquivo de vídeo
   */
  const handleSelectVideo = async () => {
    try {
      // Solicitar permissão para acessar a biblioteca de mídia
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'É necessário permitir o acesso à biblioteca de mídia para selecionar vídeos.');
        return;
      }
      
      // Abrir seletor de vídeo
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedVideo = result.assets[0];
        setSelectedFile({
          uri: selectedVideo.uri,
          type: 'video',
          name: selectedVideo.uri.split('/').pop(),
          size: selectedVideo.fileSize || 0
        });
      }
    } catch (error) {
      console.error('Erro ao selecionar vídeo:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao selecionar o vídeo. Tente novamente.');
    }
  };

  /**
   * Função para selecionar documento
   */
  const handleSelectDocument = async () => {
    try {
      // Abrir seletor de documento
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true
      });
      
      if (result.type === 'success') {
        setSelectedFile({
          uri: result.uri,
          type: 'document',
          name: result.name,
          size: result.size || 0
        });
      }
    } catch (error) {
      console.error('Erro ao selecionar documento:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao selecionar o documento. Tente novamente.');
    }
  };

  /**
   * Função para validar formulário
   * @returns {boolean} Verdadeiro se o formulário for válido
   */
  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Erro', 'O título da aula é obrigatório');
      return false;
    }
    
    if (!description.trim()) {
      Alert.alert('Erro', 'A descrição da aula é obrigatória');
      return false;
    }
    
    if (!duration.trim() || isNaN(parseInt(duration))) {
      Alert.alert('Erro', 'A duração da aula deve ser um número válido em minutos');
      return false;
    }
    
    if (contentType !== 'quiz' && !selectedFile) {
      Alert.alert('Erro', 'Selecione um arquivo para upload');
      return false;
    }
    
    return true;
  };

  /**
   * Função para adicionar nova aula
   */
  const handleAddLesson = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Simular progresso de upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return newProgress;
        });
      }, 500);
      
      // Em um app real, usaríamos:
      // const formData = new FormData();
      // formData.append('title', title);
      // formData.append('description', description);
      // formData.append('contentType', contentType);
      // formData.append('duration', parseInt(duration));
      // formData.append('isPreview', isPreview);
      // formData.append('order', lessons.length + 1);
      // 
      // if (selectedFile) {
      //   formData.append('file', {
      //     uri: selectedFile.uri,
      //     type: selectedFile.type === 'video' ? 'video/mp4' : 'application/pdf',
      //     name: selectedFile.name
      //   });
      // }
      // 
      // const result = await CourseService.addLesson(courseId, formData);
      
      // Simulação de resposta da API para fins acadêmicos
      // Aguardar para simular o upload
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newLesson = {
        id: `temp-${Date.now()}`,
        title,
        description,
        duration: parseInt(duration),
        contentType,
        isPreview,
        order: lessons.length + 1,
        content: selectedFile ? selectedFile.uri : null
      };
      
      const result = {
        success: true,
        data: {
          lesson: newLesson,
          message: 'Aula adicionada com sucesso'
        }
      };

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        // Atualizar estado local
        setLessons(prev => [...prev, result.data.lesson]);
        
        // Limpar formulário
        setTitle('');
        setDescription('');
        setDuration('');
        setContentType('video');
        setIsPreview(false);
        setSelectedFile(null);
        
        // Exibir mensagem de sucesso
        Alert.alert('Sucesso', 'Aula adicionada com sucesso!');
      } else {
        Alert.alert('Erro', result.error?.message || 'Erro ao adicionar aula');
      }
    } catch (error) {
      console.error('Erro ao adicionar aula:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao adicionar a aula. Tente novamente.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  /**
   * Função para reordenar aulas
   * @param {string} lessonId - ID da aula a ser movida
   * @param {string} direction - Direção do movimento ('up' ou 'down')
   */
  const handleReorderLesson = async (lessonId, direction) => {
    try {
      // Encontrar índice da aula
      const index = lessons.findIndex(lesson => lesson.id === lessonId);
      if (index === -1) return;
      
      // Verificar limites
      if (direction === 'up' && index === 0) return;
      if (direction === 'down' && index === lessons.length - 1) return;
      
      // Criar cópia do array de aulas
      const newLessons = [...lessons];
      
      // Trocar posições
      if (direction === 'up') {
        [newLessons[index], newLessons[index - 1]] = [newLessons[index - 1], newLessons[index]];
      } else {
        [newLessons[index], newLessons[index + 1]] = [newLessons[index + 1], newLessons[index]];
      }
      
      // Atualizar ordens
      newLessons.forEach((lesson, idx) => {
        lesson.order = idx + 1;
      });
      
      // Atualizar estado local
      setLessons(newLessons);
      
      // Em um app real, enviaríamos a nova ordem para o servidor
      // const result = await CourseService.updateLessonOrder(courseId, newLessons.map(l => ({ id: l.id, order: l.order })));
    } catch (error) {
      console.error('Erro ao reordenar aulas:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao reordenar as aulas. Tente novamente.');
    }
  };

  /**
   * Função para excluir aula
   * @param {string} lessonId - ID da aula a ser excluída
   */
  const handleDeleteLesson = (lessonId) => {
    // Confirmar exclusão
    Alert.alert(
      'Excluir aula',
      'Tem certeza que deseja excluir esta aula? Esta ação não pode ser desfeita.',
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
              // const result = await CourseService.deleteLesson(courseId, lessonId);
              
              // Simulação de resposta da API para fins acadêmicos
              const result = {
                success: true,
                data: {
                  message: 'Aula excluída com sucesso'
                }
              };

              if (result.success) {
                // Atualizar estado local
                const updatedLessons = lessons.filter(lesson => lesson.id !== lessonId);
                
                // Reordenar aulas restantes
                updatedLessons.forEach((lesson, idx) => {
                  lesson.order = idx + 1;
                });
                
                setLessons(updatedLessons);
                
                // Exibir mensagem de sucesso
                Alert.alert('Sucesso', 'Aula excluída com sucesso!');
              } else {
                Alert.alert('Erro', result.error?.message || 'Erro ao excluir aula');
              }
            } catch (error) {
              console.error('Erro ao excluir aula:', error);
              Alert.alert('Erro', 'Ocorreu um erro ao excluir a aula. Tente novamente.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  /**
   * Função para renderizar um item da lista de aulas
   */
  const renderLessonItem = ({ item, index }) => (
    <View style={styles.lessonItem}>
      <View style={styles.lessonHeader}>
        <Text style={styles.lessonNumber}>{item.order}.</Text>
        <Text style={styles.lessonTitle}>{item.title}</Text>
        {item.isPreview && (
          <View style={styles.previewBadge}>
            <Text style={styles.previewText}>Prévia</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.lessonDescription}>{item.description}</Text>
      
      <View style={styles.lessonMeta}>
        <Text style={styles.lessonType}>
          {item.contentType === 'video' ? '🎬 Vídeo' : 
           item.contentType === 'document' ? '📄 Documento' : '❓ Quiz'}
        </Text>
        <Text style={styles.lessonDuration}>{item.duration} min</Text>
      </View>
      
      <View style={styles.lessonActions}>
        <TouchableOpacity
          style={styles.lessonActionButton}
          onPress={() => handleReorderLesson(item.id, 'up')}
          disabled={index === 0}
        >
          <Text style={[
            styles.lessonActionText,
            index === 0 && styles.lessonActionDisabled
          ]}>▲</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.lessonActionButton}
          onPress={() => handleReorderLesson(item.id, 'down')}
          disabled={index === lessons.length - 1}
        >
          <Text style={[
            styles.lessonActionText,
            index === lessons.length - 1 && styles.lessonActionDisabled
          ]}>▼</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.lessonActionButton, styles.lessonEditButton]}
          onPress={() => navigation.navigate('EditLesson', { courseId, lessonId: item.id })}
        >
          <Text style={styles.lessonActionText}>Editar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.lessonActionButton, styles.lessonDeleteButton]}
          onPress={() => handleDeleteLesson(item.id)}
        >
          <Text style={[styles.lessonActionText, styles.lessonDeleteText]}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Renderizar tela de carregamento
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Carregando dados do curso...</Text>
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
          onPress={loadCourseData}
        >
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Cabeçalho do curso */}
      <View style={styles.courseHeader}>
        <Image
          source={{ uri: course.thumbnail }}
          style={styles.courseThumbnail}
          defaultSource={require('../assets/course-placeholder.png')}
        />
        <View style={styles.courseInfo}>
        
(Content truncated due to size limit. Use line ranges to read in chunks)