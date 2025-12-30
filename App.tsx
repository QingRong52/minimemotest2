
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Calendar from './pages/Calendar';
import Finance from './pages/Finance';
import RecipeDetail from './pages/RecipeDetail';
import AddRecipe from './pages/AddRecipe';
import AIBookkeeping from './pages/AIBookkeeping';
import ImportXHS from './pages/ImportXHS';
import ShoppingList from './pages/ShoppingList';
import AddFeedback from './pages/AddFeedback';
import Journal from './pages/Journal';
import { KitchenProvider } from './KitchenContext';

const App: React.FC = () => {
  return (
    <KitchenProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/recipe/:id" element={<RecipeDetail />} />
            <Route path="/add-recipe" element={<AddRecipe />} />
            <Route path="/ai-bookkeeping" element={<AIBookkeeping />} />
            <Route path="/import-xhs" element={<ImportXHS />} />
            <Route path="/shopping-list" element={<ShoppingList />} />
            <Route path="/recipe/:id/add-feedback" element={<AddFeedback />} />
            <Route path="/journal" element={<Journal />} />
          </Routes>
        </Layout>
      </Router>
    </KitchenProvider>
  );
};

export default App;
