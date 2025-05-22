import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import CartService from '../services/cart.service';
import AuthService from '../services/auth.service';

/**
 * Tela de Carrinho de Compras
 * Permite que o usuário visualize e gerencie os cursos adicionados ao carrinho
 * 
 * @returns {JSX.Element} Componente de tela de carrinho
 */
const CartScreen = ({ navigation }) => {
  // Estados para armazenar os dados
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);

  // Carregar itens do carrinho ao montar o componente
  useEffect(() => {
    // Verificar se o usuário está autenticado
    if (!AuthService.isAuthenticated()) {
      navigation.replace('Login', { returnTo: 'Cart' });
      return;
    }

    loadCartItems();
  }, []);

  /**
   * Função para carregar itens do carrinho
   */
  const loadCartItems = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Em um app real, usaríamos:
      // const result = await CartService.getCart();
      
      // Simulação de resposta da API para fins acadêmicos
      const mockCartItems = [
        {
          id: '1',
          course: {
            id: '1',
            title: 'Introdução ao React Native',
            thumbnail: 'https://example.com/react-native.jpg',
            instructor: { name: 'João Silva' },
            price: 99.90,
            discountPrice: 79.90
          }
        },
        {
          id: '2',
          course: {
            id: '2',
            title: 'Desenvolvimento Web Completo',
            thumbnail: 'https://example.com/web-dev.jpg',
            instructor: { name: 'Maria Oliveira' },
            price: 129.90,
            discountPrice: 0
          }
        }
      ];

      const result = {
        success: true,
        data: {
          items: mockCartItems,
          subtotal: 229.80,
          discount: 20.00,
          total: 209.80
        }
      };

      if (result.success) {
        setCartItems(result.data.items);
        setDiscount(result.data.discount);
        setTotal(result.data.total);
      } else {
        setError(result.error?.message || 'Erro ao carregar itens do carrinho');
      }
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
      setError('Ocorreu um erro ao carregar os itens do carrinho. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Função para remover item do carrinho
   * @param {string} itemId - ID do item a ser removido
   */
  const handleRemoveItem = async (itemId) => {
    try {
      setIsProcessing(true);

      // Em um app real, usaríamos:
      // const result = await CartService.removeFromCart(itemId);
      
      // Simulação de resposta da API para fins acadêmicos
      const result = {
        success: true,
        data: {
          message: 'Item removido do carrinho com sucesso'
        }
      };

      if (result.success) {
        // Atualizar estado local
        const updatedItems = cartItems.filter(item => item.id !== itemId);
        setCartItems(updatedItems);
        
        // Recalcular total
        const newTotal = updatedItems.reduce((sum, item) => {
          const price = item.course.discountPrice > 0 ? item.course.discountPrice : item.course.price;
          return sum + price;
        }, 0);
        
        setTotal(newTotal);
        
        // Exibir mensagem de sucesso
        Alert.alert('Sucesso', 'Item removido do carrinho com sucesso!');
      } else {
        Alert.alert('Erro', result.error?.message || 'Erro ao remover item do carrinho');
      }
    } catch (error) {
      console.error('Erro ao remover item:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao remover o item do carrinho. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Função para limpar o carrinho
   */
  const handleClearCart = async () => {
    // Confirmar ação
    Alert.alert(
      'Limpar carrinho',
      'Tem certeza que deseja remover todos os itens do carrinho?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsProcessing(true);

              // Em um app real, usaríamos:
              // const result = await CartService.clearCart();
              
              // Simulação de resposta da API para fins acadêmicos
              const result = {
                success: true,
                data: {
                  message: 'Carrinho limpo com sucesso'
                }
              };

              if (result.success) {
                // Atualizar estado local
                setCartItems([]);
                setTotal(0);
                setDiscount(0);
                
                // Exibir mensagem de sucesso
                Alert.alert('Sucesso', 'Carrinho limpo com sucesso!');
              } else {
                Alert.alert('Erro', result.error?.message || 'Erro ao limpar carrinho');
              }
            } catch (error) {
              console.error('Erro ao limpar carrinho:', error);
              Alert.alert('Erro', 'Ocorreu um erro ao limpar o carrinho. Tente novamente.');
            } finally {
              setIsProcessing(false);
            }
          }
        }
      ]
    );
  };

  /**
   * Função para aplicar cupom de desconto
   */
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      Alert.alert('Erro', 'Por favor, informe um código de cupom válido');
      return;
    }

    try {
      setIsProcessing(true);

      // Em um app real, usaríamos:
      // const result = await CartService.applyCoupon(couponCode);
      
      // Simulação de resposta da API para fins acadêmicos
      const result = {
        success: true,
        data: {
          discount: 30.00,
          total: 199.80
        }
      };

      if (result.success) {
        // Atualizar estado local
        setDiscount(result.data.discount);
        setTotal(result.data.total);
        
        // Exibir mensagem de sucesso
        Alert.alert('Sucesso', 'Cupom aplicado com sucesso!');
      } else {
        Alert.alert('Erro', result.error?.message || 'Cupom inválido ou expirado');
      }
    } catch (error) {
      console.error('Erro ao aplicar cupom:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao aplicar o cupom. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Função para finalizar a compra
   */
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Erro', 'Seu carrinho está vazio');
      return;
    }

    try {
      setIsProcessing(true);

      // Em um app real, usaríamos:
      // const result = await CartService.checkout('credit_card', couponCode);
      
      // Simulação de resposta da API para fins acadêmicos
      const result = {
        success: true,
        data: {
          orderId: '12345',
          message: 'Pedido realizado com sucesso'
        }
      };

      if (result.success) {
        // Limpar carrinho
        setCartItems([]);
        setTotal(0);
        setDiscount(0);
        setCouponCode('');
        
        // Exibir mensagem de sucesso
        Alert.alert(
          'Compra realizada',
          'Sua compra foi realizada com sucesso! Você já pode acessar seus cursos.',
          [
            {
              text: 'Ver meus cursos',
              onPress: () => navigation.navigate('MyCourses')
            }
          ]
        );
      } else {
        Alert.alert('Erro', result.error?.message || 'Erro ao finalizar compra');
      }
    } catch (error) {
      console.error('Erro no checkout:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao finalizar a compra. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Função para renderizar um item do carrinho
   */
  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image
        source={{ uri: item.course.thumbnail }}
        style={styles.courseThumbnail}
        defaultSource={require('../assets/course-placeholder.png')}
      />
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle} numberOfLines={2}>
          {item.course.title}
        </Text>
        <Text style={styles.instructorName}>
          {item.course.instructor.name}
        </Text>
        <View style={styles.priceContainer}>
          {item.course.discountPrice > 0 ? (
            <>
              <Text style={styles.originalPrice}>
                R$ {item.course.price.toFixed(2)}
              </Text>
              <Text style={styles.discountPrice}>
                R$ {item.course.discountPrice.toFixed(2)}
              </Text>
            </>
          ) : (
            <Text style={styles.price}>
              R$ {item.course.price.toFixed(2)}
            </Text>
          )}
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveItem(item.id)}
        disabled={isProcessing}
      >
        <Text style={styles.removeButtonText}>X</Text>
      </TouchableOpacity>
    </View>
  );

  /**
   * Função para renderizar o footer da lista
   */
  const renderFooter = () => (
    <View style={styles.footer}>
      {/* Resumo da compra */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Resumo da compra</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal:</Text>
          <Text style={styles.summaryValue}>
            R$ {cartItems.reduce((sum, item) => sum + item.course.price, 0).toFixed(2)}
          </Text>
        </View>
        
        {discount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Desconto:</Text>
            <Text style={styles.discountValue}>
              - R$ {discount.toFixed(2)}
            </Text>
          </View>
        )}
        
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>
            R$ {total.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Botões de ação */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.clearButton, isProcessing && styles.buttonDisabled]}
          onPress={handleClearCart}
          disabled={isProcessing || cartItems.length === 0}
        >
          <Text style={styles.clearButtonText}>Limpar carrinho</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.checkoutButton, isProcessing && styles.buttonDisabled]}
          onPress={handleCheckout}
          disabled={isProcessing || cartItems.length === 0}
        >
          <Text style={styles.checkoutButtonText}>
            {isProcessing ? 'Processando...' : 'Finalizar compra'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Renderizar tela de carregamento
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>Carregando carrinho...</Text>
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
          onPress={loadCartItems}
        >
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Renderizar carrinho vazio
  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Image
          source={require('../assets/empty-cart.png')}
          style={styles.emptyImage}
          resizeMode="contain"
        />
        <Text style={styles.emptyTitle}>Seu carrinho está vazio</Text>
        <Text style={styles.emptyText}>
          Adicione cursos ao seu carrinho para continuar comprando.
        </Text>
        <TouchableOpacity
          style={styles.browseCourseButton}
          onPress={() => navigation.navigate('CourseCatalog')}
        >
          <Text style={styles.browseCourseButtonText}>Ver cursos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Renderizar carrinho com itens
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meu Carrinho</Text>
      <Text style={styles.subtitle}>
        {cartItems.length} {cartItems.length === 1 ? 'curso' : 'cursos'} no carrinho
      </Text>
      
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.cartList}
        ListFooterComponent={renderFooter}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  browseCourseButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    width: '100%',
    maxWidth: 200,
  },
  browseCourseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  cartList: {
    paddingBottom: 16,
  },
  cartItem: {
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
    width: 100,
    height: 100,
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
    marginBottom: 8,
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
    color: '#6C63FF
(Content truncated due to size limit. Use line ranges to read in chunks)