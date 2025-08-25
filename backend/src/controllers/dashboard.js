const database = require('../config/database');

class DashboardController {

  // Estatísticas gerais do dashboard
  async getStats(req, res) {
    try {
      // Estatísticas principais
      const stats = await Promise.all([
        this.getClientStats(),
        this.getProductStats(),
        this.getServiceStats(),
        this.getQuoteStats(),
        this.getRecentActivity()
      ]);

      const [clientStats, productStats, serviceStats, quoteStats, recentActivity] = stats;

      res.json({
        success: true,
        data: {
          clients: clientStats,
          products: productStats,
          services: serviceStats,
          quotes: quoteStats,
          recentActivity
        }
      });
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }

  // Estatísticas de clientes
  async getClientStats() {
    const stats = await database.get(`
      SELECT
        COUNT(*) as total_clients,
        COUNT(CASE WHEN active = 1 THEN 1 END) as active_clients,
        COUNT(CASE WHEN created_at >= date('now', '-30 days') THEN 1 END) as new_clients_month
      FROM clients
      WHERE status != 'DELETED'
    `);

    return {
      total: stats.total_clients || 0,
      active: stats.active_clients || 0,
      newThisMonth: stats.new_clients_month || 0
    };
  }

  // Estatísticas de produtos
  async getProductStats() {
    const stats = await database.get(`
      SELECT
        COUNT(*) as total_products,
        COUNT(CASE WHEN active = 1 THEN 1 END) as active_products,
        COUNT(CASE WHEN stock <= min_stock THEN 1 END) as low_stock_products,
        SUM(stock * price) as inventory_value
      FROM products
      WHERE status != 'DELETED'
    `);

    return {
      total: stats.total_products || 0,
      active: stats.active_products || 0,
      lowStock: stats.low_stock_products || 0,
      inventoryValue: stats.inventory_value || 0
    };
  }

  // Estatísticas de serviços
  async getServiceStats() {
    const stats = await database.get(`
      SELECT
        COUNT(*) as total_services,
        COUNT(CASE WHEN active = 1 THEN 1 END) as active_services,
        AVG(price) as average_price
      FROM services
      WHERE status != 'DELETED'
    `);

    return {
      total: stats.total_services || 0,
      active: stats.active_services || 0,
      averagePrice: stats.average_price || 0
    };
  }

  // Estatísticas de orçamentos
  async getQuoteStats() {
    const stats = await database.get(`
      SELECT
        COUNT(*) as total_quotes,
        COUNT(CASE WHEN status = 'DRAFT' THEN 1 END) as draft_quotes,
        COUNT(CASE WHEN status = 'SENT' THEN 1 END) as sent_quotes,
        COUNT(CASE WHEN status = 'ACCEPTED' THEN 1 END) as accepted_quotes,
        COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected_quotes,
        SUM(CASE WHEN status = 'ACCEPTED' THEN total_value ELSE 0 END) as accepted_value,
        AVG(total_value) as average_value
      FROM quotes
      WHERE status != 'DELETED'
    `);

    const acceptanceRate = stats.total_quotes > 0 
      ? ((stats.accepted_quotes / stats.total_quotes) * 100).toFixed(2)
      : 0;

    return {
      total: stats.total_quotes || 0,
      draft: stats.draft_quotes || 0,
      sent: stats.sent_quotes || 0,
      accepted: stats.accepted_quotes || 0,
      rejected: stats.rejected_quotes || 0,
      acceptedValue: stats.accepted_value || 0,
      averageValue: stats.average_value || 0,
      acceptanceRate: parseFloat(acceptanceRate)
    };
  }

  // Atividade recente
  async getRecentActivity() {
    const activity = await database.all(`
      SELECT 
        'client' as type,
        c.name as description,
        c.created_at as date,
        'CREATE' as action
      FROM clients c
      WHERE c.active = 1
      
      UNION ALL
      
      SELECT 
        'quote' as type,
        q.description as description,
        q.created_at as date,
        'CREATE' as action
      FROM quotes q
      WHERE q.status != 'DELETED'
      
      UNION ALL
      
      SELECT 
        'product' as type,
        p.name as description,
        p.created_at as date,
        'CREATE' as action
      FROM products p
      WHERE p.active = 1
      
      ORDER BY date DESC
      LIMIT 10
    `);

    return activity;
  }

  // Gráfico de orçamentos por mês
  async getQuoteChart(req, res) {
    try {
      const { months = 6 } = req.query;
      
      const chartData = await database.all(`
        SELECT
          strftime('%Y-%m', created_at) as month,
          COUNT(*) as count,
          SUM(total_value) as total_value,
          COUNT(CASE WHEN status = 'ACCEPTED' THEN 1 END) as accepted_count,
          SUM(CASE WHEN status = 'ACCEPTED' THEN total_value ELSE 0 END) as accepted_value
        FROM quotes
        WHERE status != 'DELETED'
        AND created_at >= date('now', '-${parseInt(months)} months')
        GROUP BY strftime('%Y-%m', created_at)
        ORDER BY month ASC
      `);

      res.json({
        success: true,
        data: chartData
      });
    } catch (error) {
      console.error('Error getting quote chart:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }

  // Gráfico de produtos por categoria
  async getProductCategoryChart(req, res) {
    try {
      const chartData = await database.all(`
        SELECT
          COALESCE(category, 'Sem categoria') as category,
          COUNT(*) as count,
          SUM(stock) as total_stock,
          SUM(stock * price) as total_value
        FROM products
        WHERE status != 'DELETED'
        GROUP BY category
        ORDER BY count DESC
      `);

      res.json({
        success: true,
        data: chartData
      });
    } catch (error) {
      console.error('Error getting product category chart:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }

  // Top clientes por valor de orçamentos aceitos
  async getTopClients(req, res) {
    try {
      const { limit = 10 } = req.query;
      
      const topClients = await database.all(`
        SELECT
          c.id,
          c.name,
          c.email,
          COUNT(q.id) as quote_count,
          SUM(CASE WHEN q.status = 'ACCEPTED' THEN q.total_value ELSE 0 END) as total_value,
          COUNT(CASE WHEN q.status = 'ACCEPTED' THEN 1 END) as accepted_count
        FROM clients c
        LEFT JOIN quotes q ON c.id = q.client_id AND q.status != 'DELETED'
        WHERE c.active = 1
        GROUP BY c.id, c.name, c.email
        HAVING quote_count > 0
        ORDER BY total_value DESC
        LIMIT ?
      `, [parseInt(limit)]);

      res.json({
        success: true,
        data: topClients
      });
    } catch (error) {
      console.error('Error getting top clients:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }

  // Produtos mais vendidos (baseado em orçamentos aceitos)
  async getTopProducts(req, res) {
    try {
      const { limit = 10 } = req.query;
      
      const topProducts = await database.all(`
        SELECT
          p.id,
          p.name,
          p.category,
          p.price,
          SUM(qi.quantity) as total_quantity,
          COUNT(DISTINCT q.id) as quote_count,
          SUM(qi.quantity * qi.unit_price * (1 - qi.discount/100)) as total_revenue
        FROM products p
        JOIN quote_items qi ON p.id = qi.product_id
        JOIN quotes q ON qi.quote_id = q.id AND q.status = 'ACCEPTED'
        WHERE p.active = 1 AND q.status != 'DELETED'
        GROUP BY p.id, p.name, p.category, p.price
        ORDER BY total_quantity DESC
        LIMIT ?
      `, [parseInt(limit)]);

      res.json({
        success: true,
        data: topProducts
      });
    } catch (error) {
      console.error('Error getting top products:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }

  // Serviços mais solicitados
  async getTopServices(req, res) {
    try {
      const { limit = 10 } = req.query;
      
      const topServices = await database.all(`
        SELECT
          s.id,
          s.name,
          s.category,
          s.price,
          s.duration_hours,
          COUNT(DISTINCT q.id) as quote_count,
          SUM(qi.quantity * qi.unit_price * (1 - qi.discount/100)) as total_revenue
        FROM services s
        JOIN quote_items qi ON s.id = qi.service_id
        JOIN quotes q ON qi.quote_id = q.id AND q.status = 'ACCEPTED'
        WHERE s.active = 1 AND q.status != 'DELETED'
        GROUP BY s.id, s.name, s.category, s.price, s.duration_hours
        ORDER BY quote_count DESC
        LIMIT ?
      `, [parseInt(limit)]);

      res.json({
        success: true,
        data: topServices
      });
    } catch (error) {
      console.error('Error getting top services:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }

  // Orçamentos por status
  async getQuotesByStatus(req, res) {
    try {
      const statusData = await database.all(`
        SELECT
          status,
          COUNT(*) as count,
          SUM(total_value) as total_value,
          AVG(total_value) as average_value
        FROM quotes
        WHERE status != 'DELETED'
        GROUP BY status
        ORDER BY count DESC
      `);

      res.json({
        success: true,
        data: statusData
      });
    } catch (error) {
      console.error('Error getting quotes by status:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }

  // Produtos com estoque baixo
  async getLowStockProducts(req, res) {
    try {
      const { limit = 10 } = req.query;
      
      const lowStockProducts = await database.all(`
        SELECT
          id,
          name,
          category,
          stock,
          min_stock,
          (min_stock - stock) as deficit
        FROM products
        WHERE status != 'DELETED' 
        AND stock <= min_stock
        AND active = 1
        ORDER BY deficit DESC
        LIMIT ?
      `, [parseInt(limit)]);

      res.json({
        success: true,
        data: lowStockProducts
      });
    } catch (error) {
      console.error('Error getting low stock products:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }

  // Relatório de vendas por período
  async getSalesReport(req, res) {
    try {
      const { start_date, end_date } = req.query;
      
      if (!start_date || !end_date) {
        return res.status(400).json({
          success: false,
          error: { message: 'Parâmetros start_date e end_date são obrigatórios' }
        });
      }

      const salesData = await database.get(`
        SELECT
          COUNT(*) as total_quotes,
          COUNT(CASE WHEN status = 'ACCEPTED' THEN 1 END) as accepted_quotes,
          SUM(CASE WHEN status = 'ACCEPTED' THEN total_value ELSE 0 END) as total_revenue,
          AVG(CASE WHEN status = 'ACCEPTED' THEN total_value END) as average_order_value
        FROM quotes
        WHERE status != 'DELETED'
        AND created_at >= ?
        AND created_at <= ?
      `, [start_date, end_date]);

      const dailySales = await database.all(`
        SELECT
          DATE(created_at) as date,
          COUNT(*) as quotes_created,
          COUNT(CASE WHEN status = 'ACCEPTED' THEN 1 END) as quotes_accepted,
          SUM(CASE WHEN status = 'ACCEPTED' THEN total_value ELSE 0 END) as daily_revenue
        FROM quotes
        WHERE status != 'DELETED'
        AND created_at >= ?
        AND created_at <= ?
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `, [start_date, end_date]);

      res.json({
        success: true,
        data: {
          summary: salesData,
          daily: dailySales
        }
      });
    } catch (error) {
      console.error('Error getting sales report:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }
}

module.exports = new DashboardController();