module.exports = () => {
  return {
    packager: 'npm',
    bundle: true,
    minify: true,
    sourcemap: false,
    keepNames: true,
    external: ['pg']
  };
};
