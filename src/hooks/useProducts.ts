import { useState, useCallback, useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
import { productService } from "../services/firestore";
import { Product } from "../services/types";
import { toast } from "../theme/toast";

export const useProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProducts = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const productsSnapshot = await productService.getProducts(user.uid);
      setProducts(productsSnapshot);
    } catch (error) {
      console.error(error);
      toast("error", "Error", "Failed to load products");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  const handleDelete = async (productId: string) => {
    if (!user?.uid) return;
    try {
      await productService.deleteProduct(user.uid, productId);
      toast("success", "Deleted", "Product removed successfully");
      loadProducts();
    } catch (error) {
      console.error(error);
      toast("error", "Error", "Something went wrong");
    }
  };

  return {
    products,
    loading,
    refreshing,
    loadProducts,
    handleRefresh,
    handleDelete,
  };
};
