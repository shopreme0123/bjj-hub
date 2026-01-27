import SwiftUI

struct AuthView: View {
    private enum AuthMode {
        case signIn
        case signUp
    }

    @ObservedObject var viewModel: AppViewModel
    let allowsModeSwitch: Bool

    @State private var email = ""
    @State private var password = ""
    @State private var isAppearing = false
    @State private var mode: AuthMode

    init(viewModel: AppViewModel, initiallySignUp: Bool = false, allowsModeSwitch: Bool = true) {
        self.viewModel = viewModel
        self.allowsModeSwitch = allowsModeSwitch
        _mode = State(initialValue: initiallySignUp ? .signUp : .signIn)
    }

    private var iconName: String {
        if #available(iOS 17.0, *) {
            return "figure.wrestling"
        }
        return "figure.martial.arts"
    }

    var body: some View {
        let theme = BeltTheme(belt: .white)
        let isSignUp = mode == .signUp

        ZStack {
            // Elegant gradient background
            theme.backgroundGradient
                .ignoresSafeArea()

            // Subtle noise texture
            theme.subtleTexture
                .ignoresSafeArea()

            VStack(spacing: 0) {
                Spacer()

                // Logo and title section
                VStack(spacing: 12) {
                    // Your BJJ Logo with glow effect
                    ZStack {
                        Circle()
                            .fill(theme.meshGradient)
                            .frame(width: 96, height: 96)
                            .glowEffect(color: theme.primary, radius: 32)

                        Image(systemName: iconName)
                            .font(.system(size: 42, weight: .bold))
                            .foregroundStyle(.white)
                    }
                    .opacity(isAppearing ? 1 : 0)
                    .offset(y: isAppearing ? 0 : -30)
                    .animation(.spring(response: 0.8, dampingFraction: 0.7).delay(0.1), value: isAppearing)

                    VStack(spacing: 6) {
                        Text("Your BJJ")
                            .font(.title(30, weight: .bold))
                            .foregroundStyle(theme.textPrimary)

                        Text(isSignUp ? "新規登録して続ける" : "サインインして続ける")
                            .font(.body(14, weight: .medium))
                            .foregroundStyle(theme.textMuted)
                    }
                    .opacity(isAppearing ? 1 : 0)
                    .offset(y: isAppearing ? 0 : 20)
                    .animation(.easeOut(duration: 0.6).delay(0.3), value: isAppearing)
                }
                .padding(.bottom, 48)

                // Form section
                VStack(spacing: 16) {
                    if allowsModeSwitch {
                        // Mode toggle
                        HStack(spacing: 8) {
                            Button(action: {
                                mode = .signIn
                            }) {
                                Text("ログイン")
                                    .font(.caption(12, weight: .semibold))
                                    .foregroundStyle(mode == .signIn ? theme.textPrimary : theme.textMuted)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 10)
                                    .background(
                                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                                            .fill(mode == .signIn ? theme.card : theme.card.opacity(0.3))
                                    )
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                                            .stroke(mode == .signIn ? theme.cardBorder : theme.cardBorder.opacity(0.4), lineWidth: 1)
                                    )
                            }

                            Button(action: {
                                mode = .signUp
                            }) {
                                Text("新規登録")
                                    .font(.caption(12, weight: .semibold))
                                    .foregroundStyle(mode == .signUp ? theme.textPrimary : theme.textMuted)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 10)
                                    .background(
                                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                                            .fill(mode == .signUp ? theme.card : theme.card.opacity(0.3))
                                    )
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                                            .stroke(mode == .signUp ? theme.cardBorder : theme.cardBorder.opacity(0.4), lineWidth: 1)
                                    )
                            }
                        }
                        .opacity(isAppearing ? 1 : 0)
                        .offset(y: isAppearing ? 0 : 20)
                        .animation(.easeOut(duration: 0.5).delay(0.35), value: isAppearing)
                    }

                    // Email field
                    VStack(alignment: .leading, spacing: 8) {
                        Text("メールアドレス")
                            .font(.caption(11))
                            .foregroundStyle(theme.textMuted)
                            .textCase(.uppercase)
                            .tracking(0.5)

                        TextField("", text: $email)
                            .textInputAutocapitalization(.never)
                            .autocorrectionDisabled()
                            .keyboardType(.emailAddress)
                            .padding(14)
                            .background(theme.card)
                            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                            .overlay(
                                RoundedRectangle(cornerRadius: 14, style: .continuous)
                                    .stroke(theme.cardBorder, lineWidth: 1.5)
                            )
                            .subtleShadow()
                    }
                    .opacity(isAppearing ? 1 : 0)
                    .offset(y: isAppearing ? 0 : 20)
                    .animation(.easeOut(duration: 0.5).delay(0.4), value: isAppearing)

                    // Password field
                    VStack(alignment: .leading, spacing: 8) {
                        Text("パスワード")
                            .font(.caption(11))
                            .foregroundStyle(theme.textMuted)
                            .textCase(.uppercase)
                            .tracking(0.5)

                        SecureField("", text: $password)
                            .padding(14)
                            .background(theme.card)
                            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                            .overlay(
                                RoundedRectangle(cornerRadius: 14, style: .continuous)
                                    .stroke(theme.cardBorder, lineWidth: 1.5)
                            )
                            .subtleShadow()
                    }
                    .opacity(isAppearing ? 1 : 0)
                    .offset(y: isAppearing ? 0 : 20)
                    .animation(.easeOut(duration: 0.5).delay(0.5), value: isAppearing)

                    // Error messages
                    if let error = viewModel.authErrorMessage {
                        Text(error)
                            .font(.caption(12))
                            .foregroundStyle(Color.red)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(.top, 4)
                    }

                    // Success message (email sent)
                    if viewModel.authDebugMessage != nil {
                        VStack(spacing: 8) {
                            HStack(spacing: 8) {
                                Image(systemName: "envelope.circle.fill")
                                    .font(.app(size: 16, weight: .semibold))
                                    .foregroundStyle(theme.primary)

                                Text("確認メールを送信しました")
                                    .font(.caption(13, weight: .semibold))
                                    .foregroundStyle(theme.textPrimary)
                            }

                            Text("メールボックスを確認して、認証リンクをタップしてください。")
                                .font(.caption(11))
                                .foregroundStyle(theme.textMuted)
                                .multilineTextAlignment(.center)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .padding(.horizontal, 16)
                        .background(theme.primary.opacity(0.08))
                        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 12, style: .continuous)
                                .stroke(theme.primary.opacity(0.2), lineWidth: 1)
                        )
                        .padding(.top, 4)
                    }

                    // Login button
                    Button(action: {
                        Task {
                            if isSignUp {
                                await viewModel.signUp(email: email, password: password)
                            } else {
                                await viewModel.signIn(email: email, password: password)
                            }
                        }
                    }) {
                        ZStack {
                            if viewModel.isAuthenticating {
                                ProgressView()
                                    .tint(.white)
                            } else {
                                Text(isSignUp ? "新規登録" : "ログイン")
                                    .font(.title(16, weight: .bold))
                                    .tracking(0.5)
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: 54)
                        .foregroundStyle(.white)
                        .background(
                            ZStack {
                                theme.gradient
                                if !email.isEmpty && !password.isEmpty && !viewModel.isAuthenticating {
                                    theme.accentGlow
                                }
                            }
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                        .glowEffect(color: theme.primary.opacity(email.isEmpty || password.isEmpty ? 0 : 0.4), radius: 16)
                    }
                    .disabled(email.isEmpty || password.isEmpty || viewModel.isAuthenticating || viewModel.authDebugMessage != nil)
                    .opacity(email.isEmpty || password.isEmpty || viewModel.authDebugMessage != nil ? 0.5 : 1)
                    .scaleEffect(viewModel.isAuthenticating ? 0.98 : 1.0)
                    .animation(.easeInOut(duration: 0.2), value: viewModel.isAuthenticating)
                    .padding(.top, 8)
                    .opacity(isAppearing ? 1 : 0)
                    .offset(y: isAppearing ? 0 : 20)
                    .animation(.spring(response: 0.6, dampingFraction: 0.8).delay(0.6), value: isAppearing)
                }
                .padding(.horizontal, 28)

                // Secondary action
                if allowsModeSwitch {
                    Button(action: {
                        mode = isSignUp ? .signIn : .signUp
                    }) {
                        Text(isSignUp ? "ログインはこちら" : "新規登録はこちら")
                            .font(.caption(12, weight: .semibold))
                            .foregroundStyle(theme.textMuted)
                            .padding(.vertical, 8)
                    }
                    .opacity(isAppearing ? 1 : 0)
                    .offset(y: isAppearing ? 0 : 10)
                    .animation(.easeOut(duration: 0.4).delay(0.7), value: isAppearing)
                }

                Spacer()
                Spacer()
            }
        }
        .onAppear {
            isAppearing = true
        }
    }
}
