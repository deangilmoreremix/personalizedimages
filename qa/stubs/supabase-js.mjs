export function createClient(_url, _key) {
  return {
    storage: {
      from(bucket) {
        return {
          async upload(path, _file, _opts) {
            return { data: { path }, error: null };
          },
          getPublicUrl(path) {
            return { data: { publicUrl: `https://qa-test-project.supabase.co/storage/v1/object/public/${bucket}/${path}` } };
          },
        };
      },
    },
  };
}
