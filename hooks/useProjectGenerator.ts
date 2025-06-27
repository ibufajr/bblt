'use client';

import { useState } from 'react';

interface CodeFile {
  name: string;
  content: string;
  language: string;
  path: string;
}

export function useProjectGenerator() {
  const [generatedFiles, setGeneratedFiles] = useState<CodeFile[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const generateProject = async (prompt: string, language: 'ar' | 'en') => {
    setIsGenerating(true);
    setError(null);
    setProgress(0);

    try {
      // Simulate progress
      const progressSteps = [10, 30, 50, 70, 90, 100];
      for (let i = 0; i < progressSteps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setProgress(progressSteps[i]);
      }

      // Generate mock project based on prompt
      const mockProject = generateMockProject(prompt, language);
      setGeneratedFiles(mockProject);
      
      // Mock preview URL (in real implementation, this would be the actual dev server)
      setPreviewUrl('http://localhost:3001');
      
    } catch (err) {
      setError(language === 'ar' ? 
        'حدث خطأ أثناء إنشاء المشروع. يرجى المحاولة مرة أخرى.' : 
        'An error occurred while generating the project. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockProject = (prompt: string, language: 'ar' | 'en'): CodeFile[] => {
    const isEcommerce = prompt.toLowerCase().includes('متجر') || prompt.toLowerCase().includes('store') || prompt.toLowerCase().includes('shop');
    const isBlog = prompt.toLowerCase().includes('مدونة') || prompt.toLowerCase().includes('blog');
    const isDashboard = prompt.toLowerCase().includes('لوحة') || prompt.toLowerCase().includes('dashboard');

    if (isEcommerce) {
      return generateEcommerceProject(language);
    } else if (isBlog) {
      return generateBlogProject(language);
    } else if (isDashboard) {
      return generateDashboardProject(language);
    } else {
      return generateDefaultProject(language);
    }
  };

  const generateEcommerceProject = (language: 'ar' | 'en'): CodeFile[] => {
    return [
      {
        name: 'package.json',
        content: JSON.stringify({
          name: 'ecommerce-store',
          version: '1.0.0',
          scripts: {
            dev: 'next dev',
            build: 'next build',
            start: 'next start'
          },
          dependencies: {
            'next': '^14.0.0',
            'react': '^18.0.0',
            'react-dom': '^18.0.0',
            'tailwindcss': '^3.0.0'
          }
        }, null, 2),
        language: 'json',
        path: 'package.json'
      },
      {
        name: 'page.tsx',
        content: `'use client';

import { useState } from 'react';
import { ShoppingCart, Heart, Star } from 'lucide-react';

export default function Home() {
  const [cart, setCart] = useState([]);
  
  const products = [
    { id: 1, name: '${language === 'ar' ? 'هاتف ذكي' : 'Smartphone'}', price: 699, image: 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 2, name: '${language === 'ar' ? 'لابتوب' : 'Laptop'}', price: 1299, image: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { id: 3, name: '${language === 'ar' ? 'سماعات' : 'Headphones'}', price: 199, image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=400' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              ${language === 'ar' ? 'متجري الإلكتروني' : 'My Store'}
            </h1>
            <div className="flex items-center gap-4">
              <ShoppingCart className="h-6 w-6" />
              <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-sm">
                {cart.length}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">
                    ${'$'}{product.price}
                  </span>
                  <button 
                    onClick={() => setCart([...cart, product])}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    ${language === 'ar' ? 'أضف للسلة' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}`,
        language: 'tsx',
        path: 'app/page.tsx'
      }
    ];
  };

  const generateBlogProject = (language: 'ar' | 'en'): CodeFile[] => {
    return [
      {
        name: 'package.json',
        content: JSON.stringify({
          name: 'blog-app',
          version: '1.0.0',
          scripts: {
            dev: 'next dev',
            build: 'next build',
            start: 'next start'
          },
          dependencies: {
            'next': '^14.0.0',
            'react': '^18.0.0',
            'react-dom': '^18.0.0',
            'tailwindcss': '^3.0.0'
          }
        }, null, 2),
        language: 'json',
        path: 'package.json'
      },
      {
        name: 'page.tsx',
        content: `'use client';

import { Calendar, User, Tag } from 'lucide-react';

export default function Blog() {
  const posts = [
    {
      id: 1,
      title: '${language === 'ar' ? 'مقدمة في تطوير الويب' : 'Introduction to Web Development'}',
      excerpt: '${language === 'ar' ? 'تعلم أساسيات تطوير الويب باستخدام React و Next.js' : 'Learn the basics of web development with React and Next.js'}',
      author: '${language === 'ar' ? 'أحمد محمد' : 'John Doe'}',
      date: '2024-01-15',
      category: '${language === 'ar' ? 'برمجة' : 'Programming'}',
      image: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
    {
      id: 2,
      title: '${language === 'ar' ? 'أفضل الممارسات في البرمجة' : 'Best Practices in Programming'}',
      excerpt: '${language === 'ar' ? 'دليل شامل لأفضل الممارسات في كتابة الكود النظيف' : 'A comprehensive guide to best practices in writing clean code'}',
      author: '${language === 'ar' ? 'فاطمة أحمد' : 'Jane Smith'}',
      date: '2024-01-10',
      category: '${language === 'ar' ? 'تعليم' : 'Education'}',
      image: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 ${language === 'ar' ? 'rtl' : 'ltr'}">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ${language === 'ar' ? 'مدونتي الشخصية' : 'My Personal Blog'}
          </h1>
          <p className="text-gray-600">
            ${language === 'ar' ? 'مشاركة الأفكار والخبرات في عالم التقنية' : 'Sharing thoughts and experiences in the tech world'}
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {posts.map(post => (
            <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img 
                src={post.image} 
                alt={post.title}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {post.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {post.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    {post.category}
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {post.title}
                </h2>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {post.excerpt}
                </p>
                <button className="text-blue-600 hover:text-blue-800 font-medium">
                  ${language === 'ar' ? 'اقرأ المزيد' : 'Read More'} →
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}`,
        language: 'tsx',
        path: 'app/page.tsx'
      }
    ];
  };

  const generateDashboardProject = (language: 'ar' | 'en'): CodeFile[] => {
    return [
      {
        name: 'package.json',
        content: JSON.stringify({
          name: 'dashboard-app',
          version: '1.0.0',
          scripts: {
            dev: 'next dev',
            build: 'next build',
            start: 'next start'
          },
          dependencies: {
            'next': '^14.0.0',
            'react': '^18.0.0',
            'react-dom': '^18.0.0',
            'tailwindcss': '^3.0.0',
            'recharts': '^2.8.0'
          }
        }, null, 2),
        language: 'json',
        path: 'package.json'
      },
      {
        name: 'page.tsx',
        content: `'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Users, DollarSign, ShoppingCart } from 'lucide-react';

export default function Dashboard() {
  const salesData = [
    { month: '${language === 'ar' ? 'يناير' : 'Jan'}', sales: 4000, profit: 2400 },
    { month: '${language === 'ar' ? 'فبراير' : 'Feb'}', sales: 3000, profit: 1398 },
    { month: '${language === 'ar' ? 'مارس' : 'Mar'}', sales: 2000, profit: 9800 },
    { month: '${language === 'ar' ? 'أبريل' : 'Apr'}', sales: 2780, profit: 3908 },
    { month: '${language === 'ar' ? 'مايو' : 'May'}', sales: 1890, profit: 4800 },
    { month: '${language === 'ar' ? 'يونيو' : 'Jun'}', sales: 2390, profit: 3800 }
  ];

  const stats = [
    { title: '${language === 'ar' ? 'إجمالي المبيعات' : 'Total Sales'}', value: '$45,231', change: '+12%', icon: DollarSign, color: 'text-green-600' },
    { title: '${language === 'ar' ? 'العملاء الجدد' : 'New Customers'}', value: '2,341', change: '+5%', icon: Users, color: 'text-blue-600' },
    { title: '${language === 'ar' ? 'الطلبات' : 'Orders'}', value: '1,234', change: '+8%', icon: ShoppingCart, color: 'text-purple-600' },
    { title: '${language === 'ar' ? 'النمو' : 'Growth'}', value: '12.5%', change: '+2%', icon: TrendingUp, color: 'text-orange-600' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 ${language === 'ar' ? 'rtl' : 'ltr'}">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            ${language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className={\`text-sm \${stat.color}\`}>{stat.change}</p>
                </div>
                <div className={\`p-3 rounded-full bg-gray-100 \${stat.color}\`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">
              ${language === 'ar' ? 'المبيعات الشهرية' : 'Monthly Sales'}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">
              ${language === 'ar' ? 'الأرباح' : 'Profit Trend'}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}`,
        language: 'tsx',
        path: 'app/page.tsx'
      }
    ];
  };

  const generateDefaultProject = (language: 'ar' | 'en'): CodeFile[] => {
    return [
      {
        name: 'package.json',
        content: JSON.stringify({
          name: 'my-app',
          version: '1.0.0',
          scripts: {
            dev: 'next dev',
            build: 'next build',
            start: 'next start'
          },
          dependencies: {
            'next': '^14.0.0',
            'react': '^18.0.0',
            'react-dom': '^18.0.0',
            'tailwindcss': '^3.0.0'
          }
        }, null, 2),
        language: 'json',
        path: 'package.json'
      },
      {
        name: 'page.tsx',
        content: `'use client';

import { useState } from 'react';
import { Heart, Star, Zap } from 'lucide-react';

export default function Home() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center ${language === 'ar' ? 'rtl' : 'ltr'}">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Zap className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ${language === 'ar' ? 'مرحباً بك!' : 'Welcome!'}
          </h1>
          <p className="text-gray-600">
            ${language === 'ar' ? 'تطبيق تم إنشاؤه باستخدام الذكاء الاصطناعي' : 'AI-Generated Application'}
          </p>
        </div>

        <div className="mb-8">
          <div className="text-4xl font-bold text-blue-600 mb-2">{count}</div>
          <button 
            onClick={() => setCount(count + 1)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            ${language === 'ar' ? 'اضغط هنا' : 'Click Me'}
          </button>
        </div>

        <div className="flex items-center justify-center gap-4 text-gray-400">
          <Heart className="h-5 w-5" />
          <Star className="h-5 w-5" />
          <Zap className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}`,
        language: 'tsx',
        path: 'app/page.tsx'
      }
    ];
  };

  const downloadProject = async () => {
    if (generatedFiles.length === 0) return;

    // Create mock ZIP download
    const projectName = 'generated-project';
    const blob = new Blob(['Mock ZIP file content'], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    generateProject,
    downloadProject,
    generatedFiles,
    previewUrl,
    isGenerating,
    progress,
    error
  };
}