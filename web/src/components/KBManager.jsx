import { useState, useEffect, useCallback } from 'react';
import { kbApi } from '../api';
import { formatDate, handleAuthError } from '../utils';
import { LABELS, PLACEHOLDERS, MESSAGES, TABLE_HEADERS, BUTTON_STATES, EMPTY_STATES } from '../constants';
import Modal from './shared/Modal';
import ActionButton from './shared/ActionButton';
import InputField from './shared/InputField';

export default function KBManager() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', body: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [reembedding, setReembedding] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadArticles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await kbApi.list();
      setArticles(response.data);
    } catch (error) {
      console.error('Failed to load articles:', error);
      if (!handleAuthError(error)) {
        alert(`${MESSAGES.FAILED_LOAD_ARTICLES}: ${error.response?.data?.error || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const handleCreate = useCallback(() => {
    setEditingId(null);
    setFormData({ title: '', body: '' });
    setShowForm(true);
  }, []);

  const handleEdit = (article) => {
    setEditingId(article.id);
    setFormData({ title: article.title, body: article.body });
    setShowForm(true);
  };

  const handleDelete = useCallback(async (id) => {
    if (!confirm(MESSAGES.DELETE_CONFIRM)) return;
    
    try {
      await kbApi.delete(id);
      loadArticles();
    } catch (error) {
      console.error('Failed to delete:', error);
      if (!handleAuthError(error)) {
        alert(MESSAGES.FAILED_DELETE_ARTICLE);
      }
    }
  }, [loadArticles]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setSubmitting(true);
      
      if (editingId) {
        await kbApi.update(editingId, formData);
      } else {
        await kbApi.create(formData);
      }
      setShowForm(false);
      setFormData({ title: '', body: '' });
      loadArticles();
    } catch (error) {
      console.error('Failed to save:', error);
      if (error.response?.status === 429) {
        const retryAfter = error.response?.headers?.['retry-after'] || '60';
        alert(MESSAGES.RATE_LIMIT_EMBEDDING(retryAfter));
      } else if (!handleAuthError(error)) {
        const errorMsg = error.response?.data?.error || 
                        error.response?.data?.details || 
                        error.message || 
                        MESSAGES.UNKNOWN_ERROR;
        alert(`${MESSAGES.FAILED_SAVE_ARTICLE}: ${errorMsg}`);
      }
    } finally {
      setSubmitting(false);
    }
    
    return false;
  }, [editingId, formData, loadArticles]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      const response = await kbApi.search(searchQuery, 5);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
      if (error.response?.status === 429) {
        alert(MESSAGES.RATE_LIMIT_SEARCH);
      } else if (!handleAuthError(error)) {
        alert(`${MESSAGES.FAILED_SEARCH}: ${error.response?.data?.error || error.message}`);
      }
    }
  }, [searchQuery]);

  const handleReembed = useCallback(async () => {
    if (!confirm(MESSAGES.RE_EMBED_CONFIRM)) return;
    
    try {
      setReembedding(true);
      const response = await kbApi.reembed();
      const data = response.data;
      if (data.failed > 0) {
        alert(MESSAGES.RE_EMBED_PARTIAL(data.success, data.failed));
      } else {
        alert(MESSAGES.RE_EMBED_SUCCESS(data.success));
      }
      loadArticles(); // Refresh the list
    } catch (error) {
      console.error('Re-embedding failed:', error);
      if (error.response?.status === 429) {
        alert(MESSAGES.RATE_LIMIT_RE_EMBED);
      } else if (!handleAuthError(error)) {
        alert(`${MESSAGES.FAILED_RE_EMBED}: ${error.response?.data?.error || error.message}`);
      }
    } finally {
      setReembedding(false);
    }
  }, [loadArticles]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{LABELS.KNOWLEDGE_BASE_MANAGER}</h2>
        <div className="flex gap-2">
          <ActionButton
            onClick={handleReembed}
            label={LABELS.RE_EMBED_ALL}
            loadingLabel={LABELS.RE_EMBEDDING}
            isLoading={reembedding}
            variant="primary"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700"
          />
          <ActionButton
            onClick={handleCreate}
            label={LABELS.NEW_ARTICLE}
            variant="primary"
            className="px-4 py-2"
          />
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">{LABELS.SEARCH_KB}</h3>
        <div className="flex gap-2">
          <div className="flex-1">
            <InputField
              id="search-query"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={PLACEHOLDERS.SEARCH_KNOWLEDGE_BASE}
              className="mb-0"
            />
          </div>
          <ActionButton
            onClick={handleSearch}
            label={LABELS.SEARCH}
            variant="primary"
            className="px-4 py-2 self-end"
          />
        </div>
        {searchResults.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">{LABELS.SEARCH_RESULTS}</h4>
            <div className="space-y-2">
              {searchResults.map((result) => (
                <div key={result.id} className="p-3 bg-gray-50 rounded border">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">{result.title}</div>
                      <div className="text-sm text-gray-600 mt-1">{result.body}</div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {LABELS.SCORE} {(result.score * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Articles List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{TABLE_HEADERS.KB.TITLE}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{TABLE_HEADERS.KB.BODY}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{TABLE_HEADERS.KB.UPDATED}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{TABLE_HEADERS.KB.ACTIONS}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center">{LABELS.LOADING}</td>
              </tr>
            ) : articles.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">{EMPTY_STATES.NO_ARTICLES}</td>
              </tr>
            ) : (
              articles.map((article) => (
                <tr key={article.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{article.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">{article.body}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(article.updatedAt)}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <ActionButton
                        onClick={() => handleEdit(article)}
                        label={LABELS.EDIT}
                        variant="primary"
                        className="px-3 py-1 text-sm"
                      />
                      <ActionButton
                        onClick={() => handleDelete(article.id)}
                        label={LABELS.DELETE}
                        variant="danger"
                        className="px-3 py-1 text-sm"
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingId ? LABELS.EDIT_ARTICLE : LABELS.CREATE_ARTICLE}
      >
        <form onSubmit={handleSubmit} noValidate>
          <InputField
            id="article-title"
            label={LABELS.TITLE}
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            autoFocus
            placeholder={PLACEHOLDERS.ARTICLE_TITLE}
          />
          <InputField
            id="article-body"
            label={LABELS.BODY}
            type="textarea"
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            required
            rows={8}
            placeholder={PLACEHOLDERS.ARTICLE_CONTENT}
          />
          <div className="flex justify-end gap-2">
            <ActionButton
              type="button"
              onClick={() => setShowForm(false)}
              label={LABELS.CANCEL}
              variant="primary"
              className="px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300"
            />
            <ActionButton
              type="submit"
              label={editingId ? LABELS.UPDATE : LABELS.CREATE}
              loadingLabel={editingId ? BUTTON_STATES.UPDATING : BUTTON_STATES.CREATING}
              isLoading={submitting}
              disabled={!formData.title.trim() || !formData.body.trim() || submitting}
              variant="primary"
              className="px-4 py-2"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

