import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, UtensilsCrossed, FileDown } from 'lucide-react';
import { parseRecipeMarkdown } from './utils/recipeParser';
import { generateRecipePDF } from './utils/pdfGenerator';
import { getMealTypeLabel } from './utils/mealTypes';
import { getRecipeImage } from './utils/recipeImage';
import './RecipeDetail.css';

const RECIPES_DIR = '/recipes';

function RecipeDetail() {
  const { filename } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRecipe();
  }, [filename]);

  const loadRecipe = async () => {
    setLoading(true);
    setError(null);
    try {
      // Decode the filename in case it's URL encoded
      const decodedFilename = decodeURIComponent(filename);
      const response = await fetch(`${RECIPES_DIR}/${decodedFilename}`);
      if (!response.ok) {
        setError('Рецептата не беше намерена');
        setLoading(false);
        return;
      }
      const markdown = await response.text();
      const parsedRecipe = parseRecipeMarkdown(markdown);
      setRecipe({
        id: decodedFilename,
        filename: decodedFilename,
        ...parsedRecipe
      });
    } catch (error) {
      console.error('Error loading recipe:', error);
      setError('Грешка при зареждане на рецептата');
    } finally {
      setLoading(false);
    }
  };

  // Use the utility function for getting meal type labels

  const handleDownloadPDF = async () => {
    if (!recipe) return;
    const mealTypeLabel = getMealTypeLabel(recipe.mealType);
    try {
      await generateRecipePDF(recipe, mealTypeLabel);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Грешка при генериране на PDF файла. Моля, опитайте отново.');
    }
  };

  const renderRecipeContent = (content) => {
    const lines = content.split('\n');
    const elements = [];
    let currentList = null;
    let listItems = [];
    let keyIndex = 0;

    const flushList = () => {
      if (currentList && listItems.length > 0) {
        if (currentList.type === 'ul') {
          elements.push(
            <ul key={keyIndex++} className="recipe-text">
              {listItems}
            </ul>
          );
        } else {
          elements.push(
            <ol key={keyIndex++} className="recipe-text">
              {listItems}
            </ol>
          );
        }
        listItems = [];
        currentList = null;
      }
    };

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      
      // Handle markdown headings
      if (trimmedLine.startsWith('## ')) {
        flushList();
        elements.push(<h3 key={keyIndex++} className="recipe-content-h3">{trimmedLine.substring(3)}</h3>);
        return;
      }
      if (trimmedLine.startsWith('### ')) {
        flushList();
        elements.push(<h4 key={keyIndex++} className="recipe-content-h4">{trimmedLine.substring(4)}</h4>);
        return;
      }
      if (trimmedLine.startsWith('# ')) {
        flushList();
        elements.push(<h2 key={keyIndex++} className="recipe-content-h2">{trimmedLine.substring(2)}</h2>);
        return;
      }
      
      // Handle bullet lists
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        if (currentList?.type !== 'ul') {
          flushList();
          currentList = { type: 'ul' };
        }
        listItems.push(<li key={keyIndex++} className="recipe-content-li">{trimmedLine.substring(2)}</li>);
        return;
      }
      
      // Handle numbered lists
      const numberedMatch = trimmedLine.match(/^\d+\.\s+(.+)$/);
      if (numberedMatch) {
        if (currentList?.type !== 'ol') {
          flushList();
          currentList = { type: 'ol' };
        }
        listItems.push(<li key={keyIndex++} className="recipe-content-li">{numberedMatch[1]}</li>);
        return;
      }
      
      // Non-list line - flush any current list
      flushList();
      
      // Handle bold text (**text**)
      if (trimmedLine.includes('**')) {
        const parts = trimmedLine.split(/(\*\*.*?\*\*)/g);
        elements.push(
          <p key={keyIndex++}>
            {parts.map((part, partIndex) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={partIndex}>{part.slice(2, -2)}</strong>;
              }
              return <span key={partIndex}>{part}</span>;
            })}
          </p>
        );
        return;
      }
      
      // Regular paragraph
      if (trimmedLine) {
        elements.push(<p key={keyIndex++}>{trimmedLine}</p>);
        return;
      }
      
      // Empty line
      elements.push(<br key={keyIndex++} />);
    });

    // Flush any remaining list
    flushList();

    return elements;
  };

  if (loading) {
    return (
      <div className="recipe-detail">
        <div className="loading">
          <div className="spinner"></div>
          <p>Зареждане на рецепта...</p>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="recipe-detail">
        <div className="recipe-detail-header">
          <Link to="/recipes" className="btn-back">
            <ArrowLeft size={20} />
            Назад към рецептите
          </Link>
        </div>
        <div className="no-recipes">
          <div className="no-recipes-icon">❌</div>
          <h3>{error || 'Рецептата не беше намерена'}</h3>
          <p>Моля, опитайте отново или се върнете към списъка с рецепти.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recipe-detail">
      <div className="recipe-detail-header">
        <Link to="/recipes" className="btn-back">
          <ArrowLeft size={20} />
          Назад към рецептите
        </Link>
        <button
          className="btn-download-pdf"
          onClick={handleDownloadPDF}
          title="Изтегли като PDF"
        >
          <FileDown size={20} />
          Изтегли PDF
        </button>
      </div>

      <article className="recipe-detail-content">
        <header className="recipe-detail-title-section">
          <h1 className="recipe-detail-title">{recipe.title}</h1>
          <div className="recipe-detail-meta">
            <span className="recipe-meal-type">
              <UtensilsCrossed size={18} />
              {getMealTypeLabel(recipe.mealType)}
            </span>
            <span className="recipe-author">
              <User size={18} />
              {recipe.author}
            </span>
          </div>
        </header>

        {recipe.photo && (
          <div className="recipe-detail-photo">
            <img src={getRecipeImage(recipe.photo, recipe.title)} alt={recipe.title} />
          </div>
        )}

        <div className="recipe-detail-text">
          {renderRecipeContent(recipe.content)}
        </div>
      </article>
    </div>
  );
}

export default RecipeDetail;

