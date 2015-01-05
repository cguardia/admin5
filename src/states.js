function ModuleConfig($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/home');
  $stateProvider
    .state('site', {
             parent: 'root'
           })
    .state('site.home', {
             url: '/home',
             title: 'Home',
             views: {
               'md-content@root': {
                 template: require('./templates/home.html')
               }
             }
           })
    .state('admin', {
             url: '/admin',
             parent: 'site',
             title: 'Admin'
           })
    .state('admin.dashboard', {
             url: '/dashboard',
             title: 'Admin Dashboard',
             views: {
               'md-content@root': {
                 template: '<h1>Admin Dashboard</h1>'
               }
             }
           })
    .state('admin.archive_box', {
             url: '/archive_box',
             title: 'Archive to Box',
             views: {
               'md-content@root': {
                 template: require('./templates/box_list.html'),
                 controller: 'BoxListCtrl as ctrl',
                 resolve: {
                   resource: function (Restangular) {
                     return Restangular.all('arc2box/communities')
                       .getList({last_activity: 540});
                   }
                 }
               }
             }
           })
    .state('admin.siteannounce', {
             url: '/siteannouncement',
             title: 'Site Announcement',
             views: {
               'md-content@root': {
                 template: '<h1>Site Announcement</h1>'
               }
             }
           })
    .state('admin.logs', {
             url: '/logs',
             title: 'Logs',
             parent: 'admin'
           })
    .state('admin.logs.system_logs', {
             url: '/system_logs',
             title: 'System Logs',
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
             views: {
               'md-content@root': {
                 template: '<h1>Metrics</h1>'
               }
             }
           })
    .state('admin.logs.debug_converters', {
             url: '/debug_converters',
             title: 'Debug Converters',
             views: {
               'md-content@root': {
                 template: '<h1>Debug Converters</h1>'
               }
             }
           })

    .state('admin.content', {
             url: '/content',
             title: 'Content',
             parent: 'admin'
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
             views: {
               'md-content@root': {
                 template: '<h1>Delete Content</h1>'
               }
             }
           })

    .state('admin.people', {
             url: '/people',
             title: 'People',
             parent: 'admin'
           })
    .state('admin.people.config', {
             url: '/config',
             title: 'PDC',
             views: {
               'md-content@root': {
                 template: '<h1>People Directory Configuration</h1>'
               }
             }
           })
    .state('admin.people.upload_csv', {
             url: '/upload_csv',
             title: 'Upload CSV',
             views: {
               'md-content@root': {
                 template: '<h1>Upload CSV</h1>'
               }
             }
           })
    .state('admin.people.rename_merge', {
             url: '/rename_merge',
             title: 'Rename/Merge',
             views: {
               'md-content@root': {
                 template: '<h1>Rename/Merge</h1>'
               }
             }
           })
    .state('admin.email', {
             url: '/email',
             title: 'Email',
             parent: 'admin'
           })
    .state('admin.email.send', {
             url: '/send',
             title: 'Send to Members',
             views: {
               'md-content@root': {
                 template: '<h1>Send to Members</h1>'
               }
             }
           })
    .state('admin.email.quarantine', {
             url: '/quarantine',
             title: 'View Quarantine',
             views: {
               'md-content@root': {
                 template: '<h1>View Quarantine</h1>'
               }
             }
           })
    .state('admin.update_offices', {
             url: '/update_offices',
             title: 'Update Offices',
             views: {
               'md-content@root': {
                 template: '<h1>Update Offices</h1>'
               }
             }
           })
}

function ModuleRun(MdConfig, MdNav) {
  MdConfig.site.name = 'KARL admin5';
  var siteConfig = {
    'items': {
      'root': [
        {
          'id': 'site.home',
          'label': 'Home',
          'state': 'site.home',
          'priority': 1
        }
      ],
      'admin': {
        'id': 'dashboard',
        'label': 'Admin',
        'items': {
          'admin.dashboard': {
            id: 'admin.dashboard',
            label: 'Admin Dashboard',
            state: 'admin.dashboard'
          },
          'admin.archive_box': {
            id: 'admin.archive_box',
            label: 'Archive to Box',
            state: 'admin.archive_box'
          },
          'admin.siteannounce': {
            id: 'admin.siteannounce',
            label: 'Site Announcement',
            state: 'admin.siteannounce'
          },
          'admin.logs': {
            id: 'admin.logs',
            label: 'Logs',
            items: {
              'admin.logs.system_logs': {
                id: 'admin.logs.system_logs',
                label: 'System Logs',
                state: 'admin.logs.system_logs'
              },
              'admin.logs.feed_dump': {
                id: 'admin.logs.feed_dump',
                label: 'Feed Dump',
                state: 'admin.logs.feed_dump'
              },
              'admin.logs.metrics': {
                id: 'admin.logs.metrics',
                label: 'Metrics',
                state: 'admin.logs.metrics'
              },
              'admin.logs.debug_converters': {
                id: 'admin.logs.debug_converters',
                label: 'Debug Converters',
                state: 'admin.logs.debug_converters'
              }
            }
          },
          'admin.content': {
            id: 'admin.content',
            label: 'Content',
            items: {
              'admin.content.move': {
                id: 'admin.content.move',
                label: 'Move',
                state: 'admin.content.move'
              },
              'admin.content.delete': {
                id: 'admin.content.delete',
                label: 'Delete',
                state: 'admin.content.delete'
              }
            }
          },
          'admin.people': {
            id: 'admin.people',
            label: 'People',
            items: {
              'admin.people.config': {
                id: 'admin.people.config',
                label: 'PDC',
                state: 'admin.people.config'
              },
              'admin.people.upload_csv': {
                id: 'admin.people.upload_csv',
                label: 'Upload CSV',
                state: 'admin.people.upload_csv'
              },
              'admin.people.rename_merge': {
                id: 'admin.people.rename_merge',
                label: 'Rename/Merge',
                state: 'admin.people.rename_merge'
              }
            }
          },
          'admin.email': {
            id: 'admin.email',
            label: 'Email',
            items: {
              'admin.email.send': {
                id: 'admin.email.send',
                label: 'Send to Members',
                state: 'admin.email.send'
              },
              'admin.email.quarantine': {
                id: 'admin.email.quarantine',
                label: 'View Quarantine',
                state: 'admin.email.quarantine'
              }
            }
          },
          'admin.update_offices': {
            id: 'admin.update_offices',
            label: 'Update Offices',
            state: 'admin.update_offices'
          }
        }
      }
    }
  };
  MdNav.init(siteConfig);
}

angular.module('admin5')
  .config(ModuleConfig)
  .run(ModuleRun);