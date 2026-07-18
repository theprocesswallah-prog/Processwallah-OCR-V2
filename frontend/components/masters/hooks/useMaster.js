import { useCallback, useEffect, useState } from 'react';
import { getSupabaseClient, initializeSupabase } from '../../../assets/js/services/supabaseClient.js';

export function useMaster(table, pk, searchFields = []) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState({ key: pk, order: 'asc' });

  useEffect(() => { initializeSupabase(); }, []);

  const load = useCallback(async (opts = {}) => {
    setLoading(true);
    setError('');
    try {
      const client = getSupabaseClient();
      if (!client) throw new Error('Supabase client unavailable');

      const p = opts.page || page;
      const size = opts.pageSize || pageSize;
      const from = (p - 1) * size;
      const to = from + size - 1;

      let query = client.from(table).select('*', { count: 'exact' });
      if (search) {
        const searchQuery = searchFields.map((field) => `${field}.ilike.%${search}%`).join(',');
        query = query.or(searchQuery);
      }
      if (Object.keys(filters).length) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) query = query.ilike(key, `%${value}%`);
        });
      }
      if (sortBy?.key) query = query.order(sortBy.key, { ascending: sortBy.order === 'asc' });
      const res = await query.range(from, to);
      if (res.error) throw res.error;
      setItems(res.data || []);
      setTotal(res.count || 0);
      setPage(p);
      setPageSize(size);
    } catch (err) {
      setError(err.message || 'Failed to load records');
    } finally {
      setLoading(false);
    }
  }, [table, page, pageSize, search, sortBy]);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (payload) => {
    setLoading(true);
    setError('');
    try {
      const client = getSupabaseClient();
      const res = await client.from(table).insert([payload]).select();
      if (res.error) throw res.error;
      await load({ page: 1 });
      return { data: res.data };
    } catch (err) {
      setError(err.message || 'Create failed');
      return { error: err };
    } finally { setLoading(false); }
  }, [table, load]);

  const update = useCallback(async (id, payload) => {
    setLoading(true); setError('');
    try {
      const client = getSupabaseClient();
      const res = await client.from(table).update(payload).eq(pk, id).select();
      if (res.error) throw res.error;
      await load();
      return { data: res.data };
    } catch (err) { setError(err.message || 'Update failed'); return { error: err }; } finally { setLoading(false); }
  }, [table, pk, load]);

  const remove = useCallback(async (id) => {
    setLoading(true); setError('');
    try {
      const client = getSupabaseClient();
      const res = await client.from(table).delete().eq(pk, id).select();
      if (res.error) throw res.error;
      await load();
      return { data: res.data };
    } catch (err) { setError(err.message || 'Delete failed'); return { error: err }; } finally { setLoading(false); }
  }, [table, pk, load]);

  return {
    items, loading, error, page, pageSize, total, search, setSearch, setPage, setPageSize, sortBy, setSortBy,
    load, create, update, remove
  };
}
