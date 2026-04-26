import { Routes } from '@angular/router';
import { adminAuthGuard } from './shared/admin-auth-guard-fn';
import { performerAuthGuard } from './shared/performer-auth-guard-fn';
import { vAuthResolver, VISION_ROUTES } from './vision/vision.routes';
import { PerformerRoomComponent } from './performer-room/performer-room.component';
// import { PerformersShowcaseComponent } from './performers-showcase/performers-showcase.component';
import { memberAuthGuard } from './shared/member-auth-guard-fn';
import { privateRoomResolver } from './private-room/private-room.resolver';
import { confirmDeactivateGuard } from './private-room/confirm-deactivate.guard';
import { CategoryShowcaseComponent } from './category-showcase/category-showcase.component';
import { CommonPerformerShowcaseComponent } from './common-performer-showcase/common-performer-showcase.component';
import { langGuard } from './shared/lang-guard-fn';

export const APP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./main/main.component').then(m => m.MainComponent)
  },

  // Admin
  {
    path: 'admin-login',
    loadComponent: () => import('./admin-login/admin-login.component').then(m => m.AdminLoginComponent)
  },
  {
    path: 'admin',
    canActivate: [adminAuthGuard],
    loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'admins',
        loadComponent: () => import('./admin/admins-table/admins-table.component').then(m => m.AdminsTableComponent)
      },
      {
        path: 'admins/add',
        loadComponent: () => import('./admin/admin-info/admin-info.component').then(m => m.AdminInfoComponent)
      },
      {
        path: 'admins/edit/:id',
        loadComponent: () => import('./admin/admin-info/admin-info.component').then(m => m.AdminInfoComponent)
      },
      {
        path: 'performers',
        loadComponent: () => import('./admin/performers-table/performers-table.component').then(m => m.PerformersTableComponent)
      },
      {
        path: 'performers/portfolio/:id',
        loadComponent: () => import('./shared/performer-portfolio/performer-portfolio.component').then(m => m.PerformerPortfolioComponent)
      },
      {
        path: 'performers/add',
        loadComponent: () => import('./admin/performer-info/performer-info.component').then(m => m.PerformerInfoComponent)
      },
      {
        path: 'performers/edit/:id',
        loadComponent: () => import('./admin/performer-info/performer-info.component').then(m => m.PerformerInfoComponent)
      },
      {
        path: 'streams',
        loadComponent: () => import('./admin/streams-table/streams-table.component').then(m => m.StreamsTableComponent)
      },
      {
        path: 'members',
        loadComponent: () => import('./admin/members-table/members-table.component').then(m => m.MembersTableComponent)
      },
      {
        path: 'stream-chat/:id',
        loadComponent: () => import('./admin/chat-table/chats-table.component').then(m => m.ChatsTableComponent)
      },
      {
        path: 'payments',
        loadComponent: () => import('./admin/payments-all/payments-all.component').then(m => m.PaymentsAllComponent),
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'all' },
          {
            path: 'all',
            loadComponent: () => import('./admin/payments-all/payments-table/payments-table.component').then(m => m.PaymentsTableComponent)
          },
          {
            path: 'processing',
            loadComponent: () => import('./admin/payments-all/processing-table/processing-table.component').then(m => m.ProcessingTableComponent)
          },
          {
            path: 'processing/:id',
            loadComponent: () => import('./admin/payments-all/processing/processing.component').then(m => m.ProcessingComponent)
          },
          {
            path: 'payout',
            loadComponent: () => import('./admin/payments-all/payout-table/payout-table.component').then(m => m.PayoutTableComponent)
          },
        ]
      },
      {
        path: 'categories',
        loadComponent: () => import('./admin/categories-table/categories-table.component').then(m => m.CategoriesTableComponent)
      },
      {
        path: 'categories/edit/:id',
        loadComponent: () => import('./admin/category-info/category-info.component').then(m => m.CategoryInfoComponent)
      },
      {
        path: 'categories/add',
        loadComponent: () => import('./admin/category-info/category-info.component').then(m => m.CategoryInfoComponent)
      },
      {
        path: 'tags',
        loadComponent: () => import('./admin/tags-table/tags-table.component').then(m => m.TagsTableComponent)
      },
      {
        path: 'tags/edit/:id',
        loadComponent: () => import('./admin/tag-info/tag-info.component').then(m => m.TagInfoComponent)
      },
      {
        path: 'tags/add',
        loadComponent: () => import('./admin/tag-info/tag-info.component').then(m => m.TagInfoComponent)
      },
      {
        path: 'banners',
        loadComponent: () => import('./admin/banners-table/banners-table.component').then(m => m.BannersTableComponent)
      },
      {
        path: 'banners/edit/:id',
        loadComponent: () => import('./admin/banner-info/banner-info.component').then(m => m.BannerInfoComponent)
      },
      {
        path: 'banners/add',
        loadComponent: () => import('./admin/banner-info/banner-info.component').then(m => m.BannerInfoComponent)
      },

      { path: '**', redirectTo: '' }
    ]
  },

  // Performer
  {
    path: 'performer-login',
    loadComponent: () => import('./performer-login/performer-login.component').then(m => m.PerformerLoginComponent)
  },
  {
    path: 'performer',
    canActivate: [performerAuthGuard],
    loadComponent: () => import('./performer-dashboard/performer-dashboard.component').then(m => m.PerformerDashboardComponent),
  },
  {
    path: 'private/:roomId',
    loadComponent: () => import('./private-room/private-room.component').then(m => m.PrivateRoomComponent),
    resolve: { privateRoomData: privateRoomResolver },
    canDeactivate: [confirmDeactivateGuard]
  },
  {
    path: 'performer-balance',
    canActivate: [performerAuthGuard],
    loadComponent: () => import('./performer-balance/performer-balance.component').then(m => m.PerformerBalanceComponent)
  },
  {
    path: 'performer-payout',
    canActivate: [performerAuthGuard],
    loadComponent: () => import('./performer-payout/performer-payout.component').then(m => m.PerformerPayoutComponent)
  },
  {
    path: 'performer-profile',
    canActivate: [performerAuthGuard],
    loadComponent: () => import('./performer-profile/performer-profile.component').then(m => m.PerformerProfileComponent)
  },
  {
    path: 'performer-portfolio',
    canActivate: [performerAuthGuard],
    loadComponent: () => import('./shared/performer-portfolio/performer-portfolio.component').then(m => m.PerformerPortfolioComponent)
  },
  {
    path: 'performer-payments',
    canActivate: [performerAuthGuard],
    loadComponent: () => import('./performer-payments/performer-payments.component').then(m => m.PerformerPaymentsComponent)
  },
  {
    path: 'performers',
    canActivate: [langGuard],
    resolve: {isUserAuth: vAuthResolver}, // fore vision content
    // component: PerformersShowcaseComponent
    component: CommonPerformerShowcaseComponent
  },
  {
    path: 'categories',
    component: CategoryShowcaseComponent
  },
  {
    path: 'categories/:categoryName',
    loadComponent: () => import('./performers-showcase/performers-showcase.component').then(m => m.PerformersShowcaseComponent)
  },
  {
    path: 'performer/:nickName',
    // only for clearing local storage if token expired
    canActivate: [memberAuthGuard],
    component: PerformerRoomComponent
  },
  ...VISION_ROUTES,

  // Main
  {
    path: 'member-login',
    loadComponent: () => import('./members-login/members-login.component').then(m => m.MembersLoginComponent)
  },
  {
    path: 'bs/token-login',
    loadComponent: () => import('./members-login/bs-token-login/bs-token-login.component').then(m => m.BsTokenLoginComponent)
  },
  {
    path: 'member-register',
    loadComponent: () => import('./members-register/members-register.component').then(m => m.MembersRegisterComponent)
  },
  { path: '**', redirectTo: '' }
];
