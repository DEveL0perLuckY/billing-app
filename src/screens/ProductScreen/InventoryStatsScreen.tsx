import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BarChart } from "react-native-gifted-charts";
import Ionicons from "@react-native-vector-icons/ionicons";

import { useAuth } from "../../context/AuthProvider";
import { stockService, productService } from "../../services/firestore";
import { fonts } from "../../theme/fonts";
import { size } from "../../theme/size";
import { colors } from "../../theme/colors";
import { StockTransaction, Product } from "../../services/types";

interface ChartItem {
  value: number;
  label: string;
  frontColor: string;
}

const InventoryStatsScreen: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedProduct]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [stockHistory, productList] = await Promise.all([
        stockService.getStockHistory(user.uid, {
          productId: selectedProduct || undefined,
        }),
        productService.getProducts(user.uid),
      ]);
      setTransactions(stockHistory);
      setProducts(productList);
    } catch (error) {
      console.error("Error loading stock data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate Aggregates using FAST Product Counters
  let stockIn = 0;
  let stockOut = 0;

  if (selectedProduct) {
    const p = products.find((x) => x.id === selectedProduct);
    if (p) {
      stockIn = p.totalStockIn || 0;
      stockOut = p.totalStockOut || 0;
    }
  } else {
    // Sum of all products
    stockIn = products.reduce((sum, p) => sum + (p.totalStockIn || 0), 0);
    stockOut = products.reduce((sum, p) => sum + (p.totalStockOut || 0), 0);
  }

  // Fallback: If counters are missing (old data), fallback to history aggregation
  // This ensures backward compatibility until all products are updated.
  if (stockIn === 0 && stockOut === 0 && transactions.length > 0) {
    stockIn = transactions
      .filter((t) => t.type === "IN")
      .reduce((sum, t) => sum + t.quantity, 0);
    stockOut = transactions
      .filter((t) => t.type === "OUT")
      .reduce((sum, t) => sum + t.quantity, 0);
  }

  const chartData: ChartItem[] = [
    { value: stockIn, label: "Stock In", frontColor: colors.primary },
    { value: stockOut, label: "Stock Out", frontColor: colors.error },
  ];

  const selectedProductName = selectedProduct
    ? products.find((p) => p.id === selectedProduct)?.name || "All Products"
    : "All Products";

  if (loading) {
    return (
      <LinearGradient
        colors={[colors.primaryLight, colors.neutralBackground]}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[colors.primaryLight, colors.neutralBackground]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Stock Analytics</Text>
          <Text style={styles.subtitle}>Tracking: {selectedProductName}</Text>
        </View>

        {/* Product Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          <TouchableOpacity
            style={[
              styles.filterPill,
              !selectedProduct && styles.filterPillActive,
            ]}
            onPress={() => setSelectedProduct(null)}
          >
            <Text
              style={[
                styles.filterText,
                !selectedProduct && styles.filterTextActive,
              ]}
            >
              All Products
            </Text>
          </TouchableOpacity>
          {products.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={[
                styles.filterPill,
                selectedProduct === product.id && styles.filterPillActive,
              ]}
              onPress={() => setSelectedProduct(product.id!)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedProduct === product.id && styles.filterTextActive,
                ]}
              >
                {product.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Stock In vs Out Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.cardTitle}>Stock Flow</Text>
          {stockIn > 0 || stockOut > 0 ? (
            <BarChart
              data={chartData}
              barWidth={80}
              noOfSections={4}
              barBorderRadius={8}
              yAxisThickness={0}
              xAxisThickness={0}
              isAnimated
              animationDuration={500}
              height={200}
              xAxisLabelTextStyle={styles.axisLabel}
              yAxisTextStyle={styles.axisLabel}
            />
          ) : (
            <Text style={styles.emptyText}>No stock data available</Text>
          )}
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View
            style={[styles.summaryCard, { borderLeftColor: colors.primary }]}
          >
            <Ionicons
              name="arrow-down-circle"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.summaryValue}>{stockIn}</Text>
            <Text style={styles.summaryLabel}>Total In</Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: colors.error }]}>
            <Ionicons name="arrow-up-circle" size={24} color={colors.error} />
            <Text style={styles.summaryValue}>{stockOut}</Text>
            <Text style={styles.summaryLabel}>Total Out</Text>
          </View>
          <View
            style={[styles.summaryCard, { borderLeftColor: colors.azureblue }]}
          >
            <Ionicons name="cube" size={24} color={colors.azureblue} />
            <Text style={styles.summaryValue}>{stockIn - stockOut}</Text>
            <Text style={styles.summaryLabel}>Current</Text>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsCard}>
          <Text style={styles.cardTitle}>Recent Transactions</Text>
          {transactions.length > 0 ? (
            <FlatList
              data={transactions.slice(0, 10)}
              scrollEnabled={false}
              keyExtractor={(item) => item.id!}
              renderItem={({ item }) => (
                <View style={styles.transactionItem}>
                  <View style={styles.transactionLeft}>
                    <Ionicons
                      name={
                        item.type === "IN"
                          ? "arrow-down-circle"
                          : "arrow-up-circle"
                      }
                      size={20}
                      color={item.type === "IN" ? colors.primary : colors.error}
                    />
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionProduct}>
                        {item.productName}
                      </Text>
                      <Text style={styles.transactionMeta}>
                        {item.relatedId || "N/A"}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.transactionQty,
                      {
                        color:
                          item.type === "IN" ? colors.primary : colors.error,
                      },
                    ]}
                  >
                    {item.type === "IN" ? "+" : "-"}
                    {item.quantity}
                  </Text>
                </View>
              )}
            />
          ) : (
            <Text style={styles.emptyText}>No recent transactions</Text>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { padding: 16 },
  header: { marginBottom: 20, marginTop: 10 },
  title: {
    fontFamily: fonts.poppinsBold,
    fontSize: size(24),
    color: colors.text.Primary,
  },
  subtitle: {
    fontFamily: fonts.poppinsRegular,
    fontSize: size(14),
    color: colors.textSecondary,
    marginTop: 4,
  },
  filterContainer: { flexDirection: "row", marginBottom: 20 },
  filterPill: {
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontFamily: fonts.poppinsRegular,
    fontSize: size(12),
    color: colors.textSecondary,
  },
  filterTextActive: { color: colors.white },
  chartCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontFamily: fonts.poppinsBold,
    fontSize: size(18),
    color: colors.text.Primary,
    marginBottom: 16,
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: "center",
    borderLeftWidth: 4,
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  summaryValue: {
    fontFamily: fonts.poppinsBold,
    fontSize: size(20),
    color: colors.text.Primary,
    marginTop: 8,
  },
  summaryLabel: {
    fontFamily: fonts.poppinsRegular,
    fontSize: size(12),
    color: colors.textSecondary,
    marginTop: 4,
  },
  transactionsCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  transactionLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  transactionInfo: { marginLeft: 12, flex: 1 },
  transactionProduct: {
    fontFamily: fonts.poppinsBold,
    fontSize: size(14),
    color: colors.text.Primary,
  },
  transactionMeta: {
    fontFamily: fonts.poppinsRegular,
    fontSize: size(12),
    color: colors.textSecondary,
    marginTop: 2,
  },
  transactionQty: { fontFamily: fonts.poppinsBold, fontSize: size(16) },
  emptyText: {
    fontFamily: fonts.poppinsRegular,
    fontSize: size(14),
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 20,
  },
  axisLabel: {
    color: colors.textSecondary,
    fontSize: 10,
    fontFamily: fonts.poppinsRegular,
  },
});

export default InventoryStatsScreen;
