module.exports = function(grunt) {
  var srcPath = 'src';
  var buildPath = 'build';

  var packageJSON = grunt.file.readJSON('package.json');
  var controlsJSON = grunt.file.readJSON(srcPath+'/controls.json');

  controlsJSON.Lib = packageJSON.name;
  controlsJSON.Version = packageJSON.version;
  controlsJSON.Name = packageJSON.description;
  controlsJSON.Copyright = packageJSON.author.name;

  grunt.initConfig({
    pkg: packageJSON,
    clean: [buildPath],
    copy: {
      debug: {
        files: [{
          cwd: srcPath,
          src: ['**/*.js','!**/libs/**'],
          dest: buildPath+'/debug',
          expand: true
        }]
      },
      css_debug: {
        files: [{
          cwd: srcPath,
          src: ['**/*.css','!**/libs/**'],
          dest: buildPath+'/debug',
          expand: true
        }]
      },
      css_release: {
        files: [{
          cwd: srcPath,
          src: ['**/*.css','!**/libs/**'],
          dest: buildPath+'/release',
          expand: true
        }]
      },
      imgs_debug: {
        files: [{
          cwd: srcPath,
          src: ['**/*.{png,jpg,gif}','!**/libs/**'],
          dest: buildPath+'/debug',
          expand: true
        }]
      },
      imgs_release: {
        files: [{
          cwd: srcPath,
          src: ['**/*.{png,jpg,gif}','!**/libs/**'],
          dest: buildPath+'/release',
          expand: true
        }]
      },
      libs_debug: {
        files: [{
          cwd: srcPath,
          src: '**/libs/debug/**',
          dest: buildPath+'/debug',
          expand: true,
          rename: function (dest,src){
            return dest+'/'+src.replace('libs/debug','libs');
          }
        }]
      },
      libs_release: {
        files: [{
          cwd: srcPath,
          src: '**/libs/release/**',
          dest: buildPath+'/release',
          expand: true,
          rename: function (dest,src){
            return dest+'/'+src.replace('libs/release','libs');
          }
        }]
      },
      license: {
        files: [
          {
            src: 'LICENSE',
            dest: buildPath+'/debug',
            expand: true
          },
          {
            src: 'LICENSE',
            dest: buildPath+'/release',
            expand: true
          }
        ]
      }
    },
    closureCompiler: {
      options: {
        compilerFile: 'node_jar/closure-compiler.jar',
        compilerOpts: {
          compilation_level: 'SIMPLE_OPTIMIZATIONS'
        }
      },
      release: {
        files: [{
          cwd: srcPath,
          src: ['**/*.js','!**/libs/**'],
          dest: buildPath+'/release',
          expand: true
        }]
      }
    },
    comments: {
      options: {
        keepSpecialComments: false
      },
      remove: {
        files: [{
          cwd: buildPath,
          src: '**/*.js',
          dest: buildPath,
          expand: true
        }]
      }
    },
    usebanner: {
      options: {
        banner: grunt.file.read('HEADER')
      },
      files: {
        cwd: buildPath,
        src: '**/*.js',
        dest: buildPath,
        expand: true
      }
    }
  });

  grunt.task.registerTask(
    'exportJSON',
    'Exports controls.json file',
    function(){
      if(controlsJSON.Packages){
        for(var packageName in controlsJSON.Packages){
          var package = controlsJSON.Packages[packageName];
          var debugFiles = package.DebugFiles;
          var releaseFiles = package.ReleaseFiles;

          if(debugFiles){
            for(var i in debugFiles){
              debugFiles[i] = 'debug/'+debugFiles[i];
            }
          }
          if(releaseFiles){
            for(var j in releaseFiles){
              releaseFiles[j] = 'release/'+releaseFiles[j];
            }
          }
        }
      }
      grunt.file.write(
        buildPath+'/controls.json',
        JSON.stringify(controlsJSON,null,2)
      );
    }
  );

  grunt.registerTask('default',[
    'clean',
    'copy:debug','closureCompiler:release',
    'comments:remove','usebanner',
    'copy:css_debug','copy:css_release',
    'copy:imgs_debug','copy:imgs_release',
    'copy:libs_debug','copy:libs_release',
    'exportJSON',
    'copy:license'
  ]);

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-closure-tools');
  grunt.loadNpmTasks('grunt-stripcomments');
  grunt.loadNpmTasks('grunt-banner');
};