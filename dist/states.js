(function () {
  function ModuleConfig($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/home');
    $stateProvider
      .state('site', {
               parent: 'root'
             })
      .state('site.home', {
               url: '/home',
               title: 'Home',
               section: {
                 group: 'root',
                 priority: 0
               },
               views: {
                 'md-content@root': {
                   templateUrl: 'templates/home.html'
                 }
               }
             })
      .state('admin', {
               url: '/admin',
               parent: 'site',
               title: 'Admin',
               sectionGroup: {
                 group: 'admin'
               }
             })
      .state('admin.dashboard', {
               url: '/dashboard',
               title: 'Admin Dashboard',
               section: {group: 'admin'},
               views: {
                 'md-content@root': {
                   template: '<h1>Admin Dashboard</h1>'
                 }
               }
             })
      .state('admin.archive_box', {
               url: '/archive_box',
               title: 'Archive to Box',
               section: {group: 'admin'},
               views: {
                 'md-content@root': {
                   templateUrl: 'templates/box_list.html',
                   controller: 'BoxListCtrl as ctrl',
                   resolve: {
                     resource: function (Restangular) {
                       return Restangular.all('to_archive')
                         .getList({inactive: true});
                     }
                   }
                 }
               }
             })
      .state('admin.siteannounce', {
               url: '/siteannouncement',
               title: 'Site Announcement',
               section: {group: 'admin'},
               views: {
                 'md-content@root': {
                   template: '<h1>Site Announcement</h1>'
                 }
               }
             })
      .state('admin.logs', {
               url: '/logs',
               title: 'Logs',
               parent: 'admin',
               section: {group: 'admin'}
             })
      .state('admin.logs.system_logs', {
               url: '/system_logs',
               title: 'System Logs',
               subsection: {section: 'admin.logs'},
               views: {
                 'md-content@root': {
                   template: '<h1>System Logs</h1>'
                 }
               }
             })
      .state('admin.logs.feed_dump', {
               url: '/feed_dump',
               title: 'Feed Dump',
               subsection: {section: 'admin.logs'},
               views: {
                 'md-content@root': {
                   template: '<h1>Feed Dump</h1>'
                 }
               }
             })
      .state('admin.logs.metrics', {
               url: '/metrics',
               title: 'Metrics',
               subsection: {section: 'admin.logs'},
               views: {
                 'md-content@root': {
                   template: '<h1>Metrics</h1>'
                 }
               }
             })
      .state('admin.logs.debug_converters', {
               url: '/debug_converters',
               title: 'Debug Converters',
               subsection: {section: 'admin.logs'},
               views: {
                 'md-content@root': {
                   template: '<h1>Debug Converters</h1>'
                 }
               }
             })

      .state('admin.content', {
               url: '/content',
               title: 'Content',
               parent: 'admin',
               section: {group: 'admin'}
             })
      .state('admin.content.move', {
               url: '/move',
               title: 'Move',
               subsection: {section: 'admin.content'},
               views: {
                 'md-content@root': {
                   template: '<h1>Move Content</h1>'
                 }
               }
             })
      .state('admin.content.delete', {
               url: '/delete',
               title: 'Delete',
               subsection: {section: 'admin.content'},
               views: {
                 'md-content@root': {
                   template: '<h1>Delete Content</h1>'
                 }
               }
             })

      .state('admin.people', {
               url: '/people',
               title: 'People',
               parent: 'admin',
               section: {group: 'admin'}
             })
      .state('admin.people.config', {
               url: '/config',
               title: 'PDC',
               subsection: {section: 'admin.people'},
               views: {
                 'md-content@root': {
                   template: '<h1>People Directory Configuration</h1>'
                 }
               }
             })
      .state('admin.people.upload_csv', {
               url: '/upload_csv',
               title: 'Upload CSV',
               subsection: {section: 'admin.people'},
               views: {
                 'md-content@root': {
                   template: '<h1>Upload CSV</h1>'
                 }
               }
             })
      .state('admin.people.rename_merge', {
               url: '/rename_merge',
               title: 'Rename/Merge',
               subsection: {section: 'admin.people'},
               views: {
                 'md-content@root': {
                   template: '<h1>Rename/Merge</h1>'
                 }
               }
             })

      .state('admin.email', {
               url: '/email',
               title: 'Email',
               parent: 'admin',
               section: {group: 'admin'}
             })
      .state('admin.email.send', {
               url: '/send',
               title: 'Send to Members',
               subsection: {section: 'admin.email'},
               views: {
                 'md-content@root': {
                   template: '<h1>Send to Members</h1>'
                 }
               }
             })
      .state('admin.email.quarantine', {
               url: '/quarantine',
               title: 'View Quarantine',
               subsection: {section: 'admin.email'},
               views: {
                 'md-content@root': {
                   template: '<h1>View Quarantine</h1>'
                 }
               }
             })
      .state('admin.update_offices', {
               url: '/update_offices',
               title: 'Update Offices',
               section: {group: 'admin'},
               views: {
                 'md-content@root': {
                   template: '<h1>Update Offices</h1>'
                 }
               }
             })
  }

  function ModuleRun(MdConfig) {
    MdConfig.siteName = 'KARL';
  }

  angular.module('k5')
    .config(ModuleConfig)
    .run(ModuleRun);

})();
