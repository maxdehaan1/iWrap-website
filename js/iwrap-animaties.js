/*!
 * iWrap Motion — logo-animaties voor website en video.
 * Eén bestand, geen afhankelijkheden. Alle vormen komen 1-op-1 uit de officiële logo-vectoren.
 *
 * Gebruik (website):
 *   <div data-iwrap="uitrol" data-lockup="horizontal" data-theme="light"></div>
 *   <script src="iwrap-motion.js"></script>
 * of in JavaScript:
 *   iWrapMotion.mount('#logo', 'uitrol', { lockup: 'horizontal', theme: 'light', play: 'once' });
 */
(function (root) {
  'use strict';

  var GEO = {"mark":{"w":296.778,"h":160.337,"pills":[{"bot":[[100.922,117.023],[108.031,131.958],[101.68,149.827],[86.742,156.933],[85.708,157.426],[70.771,164.533],[52.902,158.18],[45.796,143.243]],"top":[[28.567,108.244],[21.46,93.308],[27.808,75.439],[42.747,68.335],[43.784,67.844],[58.722,60.733],[76.589,67.084],[83.694,82.023]],"S":[17.228,35.0],"tc":[56.131,95.134],"len":39.01,"ang":63.7923},{"bot":[[181.052,117.021],[188.158,131.958],[181.808,149.829],[166.869,156.933],[165.839,157.426],[150.899,164.533],[133.031,158.18],[125.923,143.244]],"top":[[78.534,43.618],[71.428,28.68],[77.771,10.812],[92.712,3.706],[93.749,3.215],[108.683,-3.891],[126.552,2.457],[133.659,17.393]],"S":[47.393,99.628],"tc":[106.096,30.505],"len":110.326,"ang":64.5596},{"bot":[[261.106,117.023],[268.215,131.958],[261.866,149.829],[246.926,156.933],[245.892,157.426],[230.955,164.533],[213.088,158.18],[205.98,143.243]],"top":[[158.591,43.617],[151.49,28.679],[157.831,10.811],[172.767,3.706],[173.801,3.212],[188.742,-3.891],[206.609,2.457],[213.717,17.391]],"S":[47.389,99.632],"tc":[186.153,30.503],"len":110.328,"ang":64.5624}],"dots":[{"cx":30.194,"cy":30.194,"r":30.194},{"cx":266.584,"cy":30.194,"r":30.194}]},"word":{"parts":[{"id":"i-dot","d":"M389.716 29.54C389.716 21.976 383.584 15.845 376.022 15.845C368.457 15.845 362.325 21.976 362.325 29.54C362.325 37.104 368.457 43.235 376.022 43.235C383.584 43.235 389.716 37.104 389.716 29.54Z","bbox":[362.325,15.845,389.716,43.235]},{"id":"i-stem","d":"M367.389 57.78L384.654 57.78C385.758 57.78 386.654 58.676 386.654 59.78L386.654 146.627C386.654 147.731 385.758 148.627 384.654 148.627L367.389 148.627C366.284 148.627 365.389 147.731 365.389 146.627L365.389 59.78C365.389 58.676 366.284 57.78 367.389 57.78Z","bbox":[365.389,57.78,386.654,148.627]},{"id":"W","d":"M574.572 32.111L542.294 147.198C542.042 148.046 541.263 148.627 540.378 148.627L519.832 148.627C518.971 148.627 518.207 148.077 517.936 147.261L488.96 60.503L459.478 147.27C459.204 148.081 458.442 148.627 457.586 148.627L436.861 148.627C435.976 148.627 435.197 148.046 434.945 147.198L402.668 32.111C402.286 30.829 403.247 29.54 404.585 29.54L423.356 29.54C424.25 29.54 425.037 30.135 425.281 30.996L448.207 119.119C448.288 119.402 448.686 119.412 448.781 119.134L478.802 30.896C479.077 30.085 479.839 29.54 480.695 29.54L498.233 29.54C499.096 29.54 499.861 30.093 500.132 30.912L529.486 119.64C529.58 119.919 529.977 119.912 530.06 119.629L553.822 30.982C554.071 30.128 554.854 29.54 555.744 29.54L572.654 29.54C573.993 29.54 574.953 30.829 574.572 32.111Z","bbox":[402.584,29.54,574.655,148.627]},{"id":"r","d":"M633.903 58.79L633.903 74.677C633.903 75.863 632.873 76.803 631.695 76.665C630.729 76.551 629.82 76.494 628.969 76.494C620.689 76.494 614.224 78.905 609.575 83.725C604.923 88.547 602.6 95.492 602.6 104.564L602.6 146.627C602.6 147.731 601.704 148.627 600.6 148.627L583.334 148.627C582.23 148.627 581.334 147.731 581.334 146.627L581.334 59.78C581.334 58.676 582.23 57.78 583.334 57.78L599.579 57.78C600.684 57.78 601.579 58.676 601.579 59.78L601.579 70.072C601.579 70.368 601.954 70.478 602.123 70.235C608.039 61.674 617.938 57.192 631.821 56.789C632.956 56.757 633.903 57.654 633.903 58.79Z","bbox":[581.334,56.789,633.903,148.627]},{"id":"a","d":"M694.852 130.678C698.991 128.24 701.912 124.754 703.613 120.216L703.613 109.668L681.667 109.668C669.418 109.668 663.293 113.695 663.293 121.746C663.293 125.605 664.825 128.666 667.887 130.935C670.949 133.203 675.203 134.337 680.646 134.337C685.976 134.337 690.71 133.118 694.852 130.678ZM714.246 66.371C721.333 72.78 724.879 82.448 724.879 95.377L724.879 146.626C724.879 147.732 723.983 148.626 722.879 148.626L706.804 148.626C705.7 148.626 704.804 147.732 704.804 146.626L704.804 138.528C704.804 138.233 704.433 138.12 704.261 138.359C701.688 141.945 698.156 144.714 693.661 146.671C688.839 148.768 683.028 149.819 676.223 149.819C669.418 149.819 663.464 148.654 658.36 146.329C653.256 144.006 649.314 140.774 646.536 136.633C643.756 132.493 642.368 127.816 642.368 122.597C642.368 114.431 645.401 107.882 651.47 102.948C657.536 98.014 667.092 95.547 680.136 95.547L703.613 95.547L703.613 94.188C703.613 87.837 701.713 82.959 697.914 79.556C694.113 76.154 688.472 74.453 680.987 74.453C675.883 74.453 670.864 75.246 665.931 76.834C661.838 78.153 658.273 79.899 655.234 82.073C654.253 82.775 652.886 82.465 652.314 81.404L645.917 69.524C645.444 68.644 645.68 67.532 646.499 66.959C650.97 63.829 656.227 61.395 662.273 59.651C668.964 57.725 676.053 56.76 683.539 56.76C696.92 56.76 707.157 59.966 714.246 66.371Z","bbox":[642.368,56.76,724.879,149.819]},{"id":"p","d":"M810.788 123.789C815.833 118.573 818.359 111.71 818.359 103.204C818.359 94.697 815.833 87.837 810.788 82.619C805.74 77.403 799.306 74.793 791.479 74.793C786.375 74.793 781.783 75.957 777.699 78.28C773.616 80.606 770.384 83.924 768.001 88.232C765.62 92.545 764.429 97.534 764.429 103.204C764.429 108.876 765.62 113.866 768.001 118.175C770.384 122.486 773.616 125.804 777.699 128.127C781.783 130.453 786.375 131.614 791.479 131.614C799.306 131.614 805.74 129.007 810.788 123.789ZM817.593 62.544C824.568 66.401 830.038 71.845 834.01 78.876C837.979 85.909 839.965 94.017 839.965 103.204C839.965 112.391 837.979 120.53 834.01 127.617C830.038 134.706 824.568 140.18 817.593 144.034C810.619 147.891 802.707 149.818 793.861 149.818C781.611 149.818 771.914 145.735 764.769 137.569L764.769 173.631C764.769 174.736 763.875 175.631 762.769 175.631L745.504 175.631C744.399 175.631 743.504 174.736 743.504 173.631L743.504 59.78C743.504 58.676 744.399 57.78 745.504 57.78L761.749 57.78C762.853 57.78 763.749 58.676 763.749 59.78L763.749 68.873C763.749 69.152 764.092 69.273 764.274 69.061C767.692 65.064 771.855 62.041 776.764 59.992C781.923 57.839 787.621 56.76 793.861 56.76C802.707 56.76 810.619 58.689 817.593 62.544Z","bbox":[743.504,56.76,839.965,175.631]}],"bbox":[362.325,15.845,839.965,175.631],"baseline":148.627},"tag":{"parts":[{"ch":"S","d":"M4.107 443.138C2.365 442.558 0.996 441.805 0 440.88L1.316 438.107C2.264 438.96 3.479 439.654 4.961 440.187C6.442 440.72 7.965 440.987 9.53 440.987C11.593 440.987 13.133 440.637 14.153 439.938C15.172 439.239 15.682 438.308 15.682 437.146C15.682 436.293 15.403 435.6 14.846 435.066C14.289 434.533 13.602 434.123 12.784 433.839C11.966 433.555 10.81 433.235 9.317 432.879C7.444 432.429 5.933 431.979 4.783 431.528C3.633 431.077 2.649 430.384 1.832 429.448C1.013 428.511 0.605 427.249 0.605 425.66C0.605 424.333 0.954 423.136 1.653 422.069C2.353 421.002 3.414 420.149 4.836 419.508C6.258 418.868 8.024 418.548 10.135 418.548C11.604 418.548 13.05 418.739 14.473 419.117C15.896 419.496 17.116 420.042 18.136 420.753L16.962 423.598C15.919 422.935 14.805 422.431 13.62 422.086C12.434 421.743 11.273 421.571 10.135 421.571C8.119 421.571 6.608 421.939 5.601 422.673C4.593 423.409 4.089 424.357 4.089 425.518C4.089 426.371 4.374 427.065 4.943 427.598C5.512 428.132 6.217 428.547 7.059 428.843C7.9 429.14 9.044 429.453 10.49 429.785C12.363 430.236 13.868 430.687 15.006 431.137C16.144 431.587 17.122 432.275 17.94 433.2C18.758 434.123 19.167 435.368 19.167 436.933C19.167 438.237 18.811 439.428 18.1 440.507C17.389 441.585 16.31 442.439 14.864 443.067C13.418 443.696 11.64 444.009 9.53 444.009C7.657 444.009 5.85 443.719 4.107 443.138Z","bbox":[-0.0,418.548,19.167,444.009]},{"ch":"P","d":"M51.562 431.653C52.747 430.692 53.34 429.312 53.34 427.509C53.34 425.709 52.747 424.327 51.562 423.367C50.376 422.407 48.657 421.926 46.406 421.926L40.361 421.926L40.361 433.092L46.406 433.092C48.657 433.092 50.376 432.613 51.562 431.653ZM54.123 421.144C55.972 422.686 56.895 424.807 56.895 427.509C56.895 430.213 55.972 432.335 54.123 433.875C52.273 435.417 49.736 436.186 46.513 436.186L40.361 436.186L40.361 443.725L36.805 443.725L36.805 418.834L46.513 418.834C49.736 418.834 52.273 419.604 54.123 421.144Z","bbox":[36.805,418.834,56.895,443.725]},{"ch":"E","d":"M92.633 440.631L92.633 443.725L74.569 443.725L74.569 418.833L92.135 418.833L92.135 421.926L78.125 421.926L78.125 429.571L90.606 429.571L90.606 432.595L78.125 432.595L78.125 440.631Z","bbox":[74.569,418.833,92.633,443.725]},{"ch":"C","d":"M115.126 442.356C113.123 441.253 111.552 439.737 110.413 437.804C109.276 435.873 108.707 433.697 108.707 431.279C108.707 428.861 109.276 426.686 110.413 424.753C111.552 422.822 113.127 421.304 115.144 420.202C117.159 419.1 119.41 418.548 121.9 418.548C123.844 418.548 125.621 418.875 127.234 419.527C128.846 420.179 130.221 421.144 131.358 422.424L129.048 424.665C127.174 422.698 124.838 421.713 122.043 421.713C120.192 421.713 118.522 422.128 117.028 422.958C115.535 423.789 114.367 424.931 113.526 426.389C112.684 427.847 112.263 429.478 112.263 431.279C112.263 433.081 112.684 434.71 113.526 436.169C114.367 437.627 115.535 438.771 117.028 439.6C118.522 440.43 120.192 440.845 122.043 440.845C124.816 440.845 127.151 439.849 129.048 437.858L131.358 440.098C130.221 441.378 128.84 442.35 127.216 443.014C125.591 443.678 123.808 444.009 121.865 444.009C119.376 444.009 117.129 443.459 115.126 442.356Z","bbox":[108.707,418.548,131.358,444.009]},{"ch":"I","d":"M148.889 418.833L152.445 418.833L152.445 443.725L148.889 443.725Z","bbox":[148.889,418.833,152.445,443.725]},{"ch":"A","d":"M186.974 434.657L181.604 422.46L176.235 434.657ZM188.219 437.502L174.99 437.502L172.252 443.724L168.589 443.724L179.862 418.833L183.382 418.833L194.69 443.724L190.956 443.724Z","bbox":[168.589,418.833,194.69,443.724]},{"ch":"L","d":"M210.835 418.833L214.391 418.833L214.391 440.631L227.868 440.631L227.868 443.725L210.835 443.725Z","bbox":[210.835,418.833,227.868,443.725]},{"ch":"I","d":"M244.403 418.833L247.959 418.833L247.959 443.725L244.403 443.725Z","bbox":[244.403,418.833,247.959,443.725]},{"ch":"S","d":"M269.704 443.138C267.962 442.558 266.593 441.805 265.597 440.88L266.913 438.107C267.861 438.96 269.076 439.654 270.558 440.187C272.039 440.72 273.562 440.987 275.127 440.987C277.19 440.987 278.73 440.637 279.75 439.938C280.769 439.239 281.279 438.308 281.279 437.146C281.279 436.293 281 435.6 280.443 435.066C279.886 434.533 279.199 434.123 278.381 433.839C277.563 433.555 276.407 433.235 274.914 432.879C273.041 432.429 271.53 431.979 270.38 431.528C269.23 431.077 268.246 430.384 267.429 429.448C266.61 428.511 266.202 427.249 266.202 425.66C266.202 424.333 266.551 423.136 267.25 422.069C267.95 421.002 269.011 420.149 270.433 419.508C271.855 418.868 273.621 418.548 275.732 418.548C277.201 418.548 278.647 418.739 280.07 419.117C281.493 419.496 282.713 420.042 283.733 420.753L282.559 423.598C281.516 422.935 280.402 422.431 279.217 422.086C278.031 421.743 276.87 421.571 275.732 421.571C273.716 421.571 272.205 421.939 271.198 422.673C270.19 423.409 269.686 424.357 269.686 425.518C269.686 426.371 269.971 427.065 270.54 427.598C271.109 428.132 271.814 428.547 272.656 428.843C273.497 429.14 274.641 429.453 276.087 429.785C277.96 430.236 279.465 430.687 280.603 431.137C281.741 431.587 282.719 432.275 283.537 433.2C284.355 434.123 284.764 435.368 284.764 436.933C284.764 438.237 284.408 439.428 283.697 440.507C282.986 441.585 281.907 442.439 280.461 443.067C279.015 443.696 277.237 444.009 275.127 444.009C273.254 444.009 271.447 443.719 269.704 443.138Z","bbox":[265.597,418.548,284.764,444.009]},{"ch":"T","d":"M306.989 421.926L298.454 421.926L298.454 418.833L319.044 418.833L319.044 421.926L310.51 421.926L310.51 443.725L306.989 443.725Z","bbox":[298.454,418.833,319.044,443.725]},{"ch":"I","d":"M357.377 418.833L360.933 418.833L360.933 443.725L357.377 443.725Z","bbox":[357.377,418.833,360.933,443.725]},{"ch":"N","d":"M402.254 418.833L402.254 443.725L399.338 443.725L384.403 425.162L384.403 443.725L380.847 443.725L380.847 418.833L383.763 418.833L398.698 437.395L398.698 418.833Z","bbox":[380.847,418.833,402.254,443.725]},{"ch":"K","d":"M452.286 432.665L447.735 437.288L447.735 443.725L444.179 443.725L444.179 418.833L447.735 418.833L447.735 432.736L461.247 418.833L465.301 418.833L454.669 430.034L465.977 443.725L461.816 443.725Z","bbox":[444.179,418.833,465.977,443.725]},{"ch":"O","d":"M497.466 439.6C498.924 438.771 500.073 437.626 500.915 436.168C501.757 434.71 502.177 433.08 502.177 431.279C502.177 429.478 501.757 427.847 500.915 426.389C500.073 424.931 498.924 423.788 497.466 422.957C496.008 422.128 494.366 421.713 492.541 421.713C490.715 421.713 489.062 422.128 487.58 422.957C486.098 423.788 484.937 424.931 484.095 426.389C483.254 427.847 482.833 429.478 482.833 431.279C482.833 433.08 483.254 434.71 484.095 436.168C484.937 437.626 486.098 438.771 487.58 439.6C489.062 440.43 490.715 440.845 492.541 440.845C494.366 440.845 496.008 440.43 497.466 439.6ZM485.749 442.356C483.734 441.253 482.151 439.731 481.002 437.787C479.851 435.843 479.277 433.673 479.277 431.279C479.277 428.885 479.851 426.715 481.002 424.772C482.151 422.828 483.734 421.304 485.749 420.202C487.763 419.1 490.028 418.548 492.541 418.548C495.03 418.548 497.282 419.1 499.297 420.202C501.312 421.304 502.889 422.822 504.027 424.753C505.165 426.686 505.734 428.861 505.734 431.279C505.734 433.697 505.165 435.872 504.027 437.804C502.889 439.737 501.312 441.253 499.297 442.356C497.282 443.458 495.03 444.009 492.541 444.009C490.028 444.009 487.763 443.458 485.749 442.356Z","bbox":[479.277,418.548,505.734,444.009]},{"ch":"Z","d":"M541.933 440.631L541.933 443.725L521.131 443.725L521.131 441.307L536.777 421.926L521.379 421.926L521.379 418.833L541.471 418.833L541.471 421.251L525.895 440.631Z","bbox":[521.131,418.833,541.933,443.725]},{"ch":"I","d":"M559.145 418.833L562.701 418.833L562.701 443.725L559.145 443.725Z","bbox":[559.145,418.833,562.701,443.725]},{"ch":"J","d":"M581.654 443.067C580.374 442.439 579.342 441.556 578.56 440.419L580.623 438C581.997 439.968 583.728 440.952 585.814 440.952C587.213 440.952 588.274 440.525 588.997 439.671C589.72 438.818 590.082 437.562 590.082 435.902L590.082 421.926L581.085 421.926L581.085 418.834L593.602 418.834L593.602 435.724C593.602 438.474 592.944 440.543 591.629 441.929C590.313 443.316 588.375 444.009 585.814 444.009C584.321 444.009 582.934 443.696 581.654 443.067Z","bbox":[578.56,418.834,593.602,444.009]},{"ch":"N","d":"M634.71 418.833L634.71 443.725L631.793 443.725L616.859 425.162L616.859 443.725L613.303 443.725L613.303 418.833L616.219 418.833L631.154 437.395L631.154 418.833Z","bbox":[613.303,418.833,634.71,443.725]},{"ch":"F","d":"M658.179 421.926L658.179 430.603L670.66 430.603L670.66 433.661L658.179 433.661L658.179 443.725L654.623 443.725L654.623 418.833L672.189 418.833L672.189 421.926Z","bbox":[654.623,418.833,672.189,443.725]},{"ch":"O","d":"M705.527 439.6C706.985 438.771 708.134 437.626 708.976 436.168C709.818 434.71 710.238 433.08 710.238 431.279C710.238 429.478 709.818 427.847 708.976 426.389C708.134 424.931 706.985 423.788 705.527 422.957C704.069 422.128 702.427 421.713 700.602 421.713C698.776 421.713 697.123 422.128 695.641 422.957C694.159 423.788 692.998 424.931 692.156 426.389C691.315 427.847 690.894 429.478 690.894 431.279C690.894 433.08 691.315 434.71 692.156 436.168C692.998 437.626 694.159 438.771 695.641 439.6C697.123 440.43 698.776 440.845 700.602 440.845C702.427 440.845 704.069 440.43 705.527 439.6ZM693.81 442.356C691.795 441.253 690.212 439.731 689.063 437.787C687.912 435.843 687.338 433.673 687.338 431.279C687.338 428.885 687.912 426.715 689.063 424.772C690.212 422.828 691.795 421.304 693.81 420.202C695.824 419.1 698.089 418.548 700.602 418.548C703.091 418.548 705.343 419.1 707.358 420.202C709.373 421.304 710.95 422.822 712.088 424.753C713.226 426.686 713.795 428.861 713.795 431.279C713.795 433.697 713.226 435.872 712.088 437.804C710.95 439.737 709.373 441.253 707.358 442.356C705.343 443.458 703.091 444.009 700.602 444.009C698.089 444.009 695.824 443.458 693.81 442.356Z","bbox":[687.338,418.548,713.795,444.009]},{"ch":"L","d":"M731.681 418.833L735.237 418.833L735.237 440.631L748.714 440.631L748.714 443.725L731.681 443.725Z","bbox":[731.681,418.833,748.714,443.725]},{"ch":"I","d":"M765.25 418.833L768.806 418.833L768.806 443.725L765.25 443.725Z","bbox":[765.25,418.833,768.806,443.725]},{"ch":"E","d":"M806.784 440.631L806.784 443.725L788.72 443.725L788.72 418.833L806.286 418.833L806.286 421.926L792.276 421.926L792.276 429.571L804.757 429.571L804.757 432.595L792.276 432.595L792.276 440.631Z","bbox":[788.72,418.833,806.784,443.725]}],"bbox":[-0.0,418.548,806.784,444.009],"words":[10,2,11]},"lockups":{"mark":{"w":296.778,"h":160.337,"mark":[0,0]},"horizontal":{"w":839.965,"h":175.631,"mark":[0.0,0.0],"word":[0.0,0.0]},"stacked":{"w":477.639,"h":370.994,"mark":[90.431,-0.0],"word":[-362.326,195.363]},"tagline":{"w":806.784,"h":444.009,"mark":[255.003,-0.0],"word":[-197.754,195.363],"tag":[0.0,0.0]}},"icon":{"w":895.143,"h":922.369},"colors":{"mint":"#A7CEC5","ink":"#262626","gray":"#676A6B","white":"#FFFFFF"}};
  var NS = 'http://www.w3.org/2000/svg';
  var C = GEO.colors;
  var M = GEO.mark;

  // De schuinte van de banen in het beeldmerk: alle beweging volgt deze richting.
  var THETA = Math.atan2(M.pills[1].S[1], M.pills[1].S[0]);
  var UX = Math.cos(THETA), UY = Math.sin(THETA), COT = UX / UY;
  var uid = 0;

  /* ------------------------------------------------------------------ helpers */

  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function f(n) { return Math.round(n * 1000) / 1000; }

  function bezier(x1, y1, x2, y2) {
    var cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    var cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    function sx(t) { return ((ax * t + bx) * t + cx) * t; }
    function sy(t) { return ((ay * t + by) * t + cy) * t; }
    function dx(t) { return (3 * ax * t + 2 * bx) * t + cx; }
    return function (x) {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      var t = x, i, e, d;
      for (i = 0; i < 8; i++) {
        e = sx(t) - x;
        if (Math.abs(e) < 1e-6) return sy(t);
        d = dx(t);
        if (Math.abs(d) < 1e-6) break;
        t -= e / d;
      }
      var lo = 0, hi = 1;
      t = x;
      for (i = 0; i < 32; i++) {
        e = sx(t);
        if (Math.abs(e - x) < 1e-6) break;
        if (x > e) lo = t; else hi = t;
        t = (lo + hi) / 2;
      }
      return sy(t);
    };
  }

  // Easing-set. "out" = aandrukken (snel starten, lang uitlopen), "roll" = uitrollen met mini-overshoot.
  var E = {
    lin: function (t) { return t; },
    out: bezier(0.16, 1, 0.3, 1),
    outSoft: bezier(0.25, 1, 0.5, 1),
    inOut: bezier(0.65, 0, 0.35, 1),
    glide: bezier(0.5, 0, 0.15, 1),
    roll: bezier(0.6, 0, 0.2, 1.18),
    rollFlat: bezier(0.6, 0, 0.2, 1),
    in: bezier(0.7, 0, 0.84, 0),
    inSoft: bezier(0.5, 0, 0.75, 0),
    pop: function (t) { var c = 1.6, u = t - 1; return 1 + (c + 1) * u * u * u + c * u * u; }
  };
  function seg(t, t0, d, e) { var p = clamp((t - t0) / d, 0, 1); return e ? e(p) : p; }

  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name), k;
    if (attrs) for (k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  // setAttribute met cache: alleen schrijven als de waarde echt verandert.
  function sa(n, k, v) {
    var c = n.__iw || (n.__iw = {});
    if (c[k] === v) return;
    c[k] = v;
    if (v === null) n.removeAttribute(k); else n.setAttribute(k, v);
  }
  function tr(x, y, s) {
    var out = (x || y) ? 'translate(' + f(x) + ' ' + f(y) + ')' : '';
    if (s != null && s !== 1) out += (out ? ' ' : '') + 'scale(' + f(s) + ')';
    return out || null;
  }

  // Mengt twee hex-kleuren.
  function mix(a, b, t) {
    function h(c, i) { return parseInt(c.substr(1 + i * 2, 2), 16); }
    var out = '#', i, v;
    for (i = 0; i < 3; i++) {
      v = Math.round(lerp(h(a, i), h(b, i), t)).toString(16);
      out += v.length < 2 ? '0' + v : v;
    }
    return out.toUpperCase();
  }

  /* ------------------------------------------------------------- vormen */

  // Exacte baan uit het logo. a = positie bovenkap (0 = thuis, 1 = helemaal onderaan),
  // b = positie onderkap (1 = thuis, 0 = helemaal bovenaan). a=0,b=1 is pixel-exact het origineel.
  function pillD(p, a, b) {
    var sx = p.S[0], sy = p.S[1];
    var tx = a * sx, ty = a * sy, bx = (b - 1) * sx, by = (b - 1) * sy;
    var B = p.bot, T = p.top;
    function P(q, ox, oy) { return f(q[0] + ox) + ' ' + f(q[1] + oy); }
    return 'M' + P(B[0], bx, by) + 'C' + P(B[1], bx, by) + ' ' + P(B[2], bx, by) + ' ' + P(B[3], bx, by) +
      'L' + P(B[4], bx, by) + 'C' + P(B[5], bx, by) + ' ' + P(B[6], bx, by) + ' ' + P(B[7], bx, by) +
      'L' + P(T[0], tx, ty) + 'C' + P(T[1], tx, ty) + ' ' + P(T[2], tx, ty) + ' ' + P(T[3], tx, ty) +
      'L' + P(T[4], tx, ty) + 'C' + P(T[5], tx, ty) + ' ' + P(T[6], tx, ty) + ' ' + P(T[7], tx, ty) + 'Z';
  }
  function circleD(cx, cy, r) {
    return 'M' + f(cx - r) + ' ' + f(cy) + 'A' + f(r) + ' ' + f(r) + ' 0 1 1 ' + f(cx + r) + ' ' + f(cy) +
      'A' + f(r) + ' ' + f(r) + ' 0 1 1 ' + f(cx - r) + ' ' + f(cy) + 'Z';
  }

  var THEMES = {
    light: { bg: '#FFFFFF', mark: C.mint, word: C.ink, tag: C.gray, sheen: '#CDE4DE', wordHi: '#8A8A8A',
             pat: ['#EEF6F4', '#E3F0EC'], under: C.ink },
    dark: { bg: C.ink, mark: C.mint, word: '#FFFFFF', tag: C.mint, sheen: '#CDE4DE', wordHi: '#CFE6E0',
            pat: ['#2E2F2F', '#353737'], under: '#FFFFFF' },
    mint: { bg: C.mint, mark: '#FFFFFF', word: '#FFFFFF', tag: '#FFFFFF', sheen: '#E4F1EE', wordHi: '#E4F1EE',
            pat: ['#9DC7BD', '#B3D6CE'], under: '#FFFFFF' }
  };
  function theme(o) {
    var t = o.theme || 'light', base = typeof t === 'string' ? (THEMES[t] || THEMES.light) : t, out = {}, k;
    for (k in THEMES.light) out[k] = THEMES.light[k];
    for (k in base) out[k] = base[k];
    return out;
  }

  function Stage(o, W, H, th) {
    var id = 'iw' + (++uid);
    var svg = el('svg', { xmlns: NS, viewBox: '0 0 ' + f(W) + ' ' + f(H), role: 'img', 'aria-label': o.label || 'iWrap' });
    svg.style.display = 'block';
    svg.style.width = '100%';
    svg.style.height = o.frame ? '100%' : 'auto';
    var defs = el('defs', null, svg);
    var bg = o.bg === true ? th.bg : (typeof o.bg === 'string' ? o.bg : null);
    if (bg) el('rect', { x: 0, y: 0, width: f(W), height: f(H), fill: bg }, svg);
    return { id: id, svg: svg, defs: defs, W: W, H: H };
  }

  // Plaatst een lock-up in het beeld. Zonder "frame" krijgt de SVG precies de maat van het logo (+ marge).
  function layout(o, lw, lh, pad) {
    var W, H, s;
    if (o.frame) {
      W = o.frame[0]; H = o.frame[1];
      s = Math.min(W * (o.fit || 0.44) / lw, H * (o.fitH || 0.56) / lh);
    } else {
      pad = o.pad != null ? o.pad : pad;
      W = lw + 2 * pad; H = lh + 2 * pad; s = 1;
    }
    return { W: W, H: H, s: s, ox: (W - lw * s) / 2 + (o.dx || 0), oy: (H - lh * s) / 2 + (o.dy || 0) };
  }

  /* --- beeldmerk --- */
  function Mark(parent, fill) {
    var g = el('g', null, parent);
    this.g = g;
    this.dots = M.dots.map(function (d) { return el('circle', { cx: d.cx, cy: d.cy, r: d.r, fill: fill }, g); });
    this.pills = M.pills.map(function (p) { return el('path', { d: pillD(p, 0, 1), fill: fill }, g); });
  }
  Mark.prototype.fill = function (c) {
    var i;
    for (i = 0; i < 2; i++) sa(this.dots[i], 'fill', c);
    for (i = 0; i < 3; i++) sa(this.pills[i], 'fill', c);
  };
  // st = { d: [schaalL, schaalR], p: [[a, b, schaal] x3], o: [[dx,dy],[dx,dy]] (optioneel, stip-verschuiving) }
  Mark.prototype.set = function (st) {
    var i, q, p, a, b, s, m, cx, cy, d, off;
    for (i = 0; i < 2; i++) {
      d = M.dots[i]; s = Math.max(0, st.d[i]); off = st.o ? st.o[i] : null;
      sa(this.dots[i], 'r', f(d.r * s));
      sa(this.dots[i], 'cx', f(d.cx + (off ? off[0] : 0)));
      sa(this.dots[i], 'cy', f(d.cy + (off ? off[1] : 0)));
    }
    for (i = 0; i < 3; i++) {
      q = st.p[i]; p = M.pills[i]; a = q[0]; b = q[1]; s = q[2];
      if (s <= 0.0005) { sa(this.pills[i], 'visibility', 'hidden'); continue; }
      sa(this.pills[i], 'visibility', null);
      sa(this.pills[i], 'd', pillD(p, a, b));
      if (s === 1) sa(this.pills[i], 'transform', null);
      else {
        m = (a + b) / 2; cx = p.tc[0] + m * p.S[0]; cy = p.tc[1] + m * p.S[1];
        sa(this.pills[i], 'transform', 'translate(' + f(cx) + ' ' + f(cy) + ') scale(' + f(s) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')');
      }
    }
  };

  var MARK_FULL = { d: [1, 1], p: [[0, 1, 1], [0, 1, 1], [0, 1, 1]] };
  var MARK_NONE = { d: [0, 0], p: [[0, 1, 0], [0, 1, 0], [0, 1, 0]] };

  // "De uitrol": stippen landen, drie ervan rollen langs de schuinte uit tot banen.
  function markIntro(tau) {
    var p = [], k;
    for (k = 0; k < 3; k++) {
      p.push([0,
        seg(tau, 0.16 + 0.10 * k, k === 0 ? 0.72 : 0.92, E.roll),
        seg(tau, 0.06 + 0.09 * k, 0.32, E.out)]);
    }
    return { d: [seg(tau, 0, 0.5, E.pop), seg(tau, 0.84, 0.5, E.pop)], p: p };
  }
  markIntro.dur = 1.36;

  // Uitgang: de banen rollen door (staart haalt de kop in) en de stippen verdwijnen.
  function markOutro(tau) {
    var p = [], k;
    for (k = 0; k < 3; k++) {
      p.push([seg(tau, 0.05 * k, 0.36, E.in), 1, 1 - seg(tau, 0.30 + 0.05 * k, 0.22, E.in)]);
    }
    return { d: [1 - seg(tau, 0, 0.26, E.in), 1 - seg(tau, 0.34, 0.26, E.in)], p: p };
  }
  markOutro.dur = 0.64;

  /* --- woordmerk --- */
  var LETTER_OF = [0, 0, 1, 2, 3, 4];   // onderdeel -> letterindex (i-stip en i-stam horen bij "i")
  function Word(parent, fill) {
    var g = el('g', null, parent);
    this.g = g;
    this.parts = GEO.word.parts.map(function (p) { return el('path', { d: p.d, fill: fill }, g); });
  }
  Word.prototype.fill = function (c) { this.parts.forEach(function (n) { sa(n, 'fill', c); }); };
  // per letter een x-verschuiving (array van 5)
  Word.prototype.shift = function (dx) {
    for (var i = 0; i < this.parts.length; i++) {
      var v = dx[LETTER_OF[i]];
      sa(this.parts[i], 'transform', v ? 'translate(' + f(v) + ' 0)' : null);
    }
  };

  /* --- tagline --- */
  function Tagline(parent, fill) {
    var g = el('g', null, parent), T = GEO.tag;
    this.g = g;
    this.cx = T.parts.map(function (p) { return (p.bbox[0] + p.bbox[2]) / 2; });
    this.mid = (T.bbox[0] + T.bbox[2]) / 2;
    this.parts = T.parts.map(function (p) { return el('path', { d: p.d, fill: fill }, g); });
  }
  // "Track-in": letters komen van iets wijder gespatieerd naar hun plek.
  Tagline.prototype.set = function (tau, out) {
    var n = this.parts.length, i, p, o, x;
    for (i = 0; i < n; i++) {
      p = seg(tau, i * 0.02, 0.85, E.out);
      o = seg(tau, i * 0.02, 0.4) * (out == null ? 1 : out);
      x = (this.cx[i] - this.mid) * 0.09 * (1 - p);
      sa(this.parts[i], 'opacity', o >= 1 ? null : f(o));
      sa(this.parts[i], 'transform', Math.abs(x) < 0.001 ? null : 'translate(' + f(x) + ' 0)');
    }
  };
  Tagline.dur = 0.85 + 22 * 0.02;

  /* --- schuine maskers (de "rakel") --- */
  function SlantClip(stage, target) {
    var id = stage.id + 'c' + (++uid);
    var cp = el('clipPath', { id: id, clipPathUnits: 'userSpaceOnUse' }, stage.defs);
    var poly = el('polygon', { points: '0,0 0,0 0,0' }, cp);
    this.target = target;
    this.url = 'url(#' + id + ')';
    this.poly = poly;
  }
  // x = waar de schuine rand y=0 kruist. side: -1 = links zichtbaar, +1 = rechts zichtbaar.
  SlantClip.prototype.set = function (x, side) {
    var yA = -3000, yB = 4000, far = side < 0 ? -20000 : 20000;
    sa(this.poly, 'points', f(x + yA * COT) + ',' + yA + ' ' + f(x + yB * COT) + ',' + yB + ' ' + far + ',' + yB + ' ' + far + ',' + yA);
    sa(this.target, 'clip-path', this.url);
  };
  SlantClip.prototype.off = function () { sa(this.target, 'clip-path', null); };

  /* --- glans (folie-highlight) als meebewegend verloop --- */
  function Sheen(stage, base, light) {
    var id = stage.id + 'g' + (++uid);
    var lg = el('linearGradient', { id: id, gradientUnits: 'userSpaceOnUse' }, stage.defs);
    el('stop', { offset: 0, 'stop-color': base }, lg);
    el('stop', { offset: 0.5, 'stop-color': light }, lg);
    el('stop', { offset: 1, 'stop-color': base }, lg);
    this.lg = lg;
    this.url = 'url(#' + id + ')';
  }
  Sheen.prototype.at = function (x, w) {
    sa(this.lg, 'x1', f(x - w / 2 * UY)); sa(this.lg, 'y1', f(w / 2 * UX));
    sa(this.lg, 'x2', f(x + w / 2 * UY)); sa(this.lg, 'y2', f(-w / 2 * UX));
  };

  /* ================================================================ scènes */

  var SC = {};

  /* 1. UITROL — de signatuur-animatie -------------------------------------- */
  SC.uitrol = function (o) {
    var lockName = o.lockup || 'horizontal', L = GEO.lockups[lockName], th = theme(o);
    var lay = layout(o, L.w, L.h, 14);
    var st = Stage(o, lay.W, lay.H, th);
    var rootG = el('g', { transform: 'translate(' + f(lay.ox) + ' ' + f(lay.oy) + ') scale(' + f(lay.s) + ')' }, st.svg);
    return uitrolInto(st, rootG, L, lockName, th, o);
  };

  function uitrolInto(st, rootG, L, lockName, th, o) {
    var hasWord = !!L.word, hasTag = !!L.tag;
    var shift = hasWord && o.shift !== false;
    var emerge = shift && lockName === 'horizontal';
    var wordClipG, wordG, word, clip, tagG, tag;
    if (hasWord) {
      wordClipG = el('g', null, rootG);
      wordG = el('g', { transform: 'translate(' + L.word[0] + ' ' + L.word[1] + ')' }, wordClipG);
      word = new Word(wordG, th.word);
      clip = new SlantClip(st, wordClipG);
    }
    if (hasTag) {
      tagG = el('g', { transform: 'translate(' + L.tag[0] + ' ' + L.tag[1] + ')' }, rootG);
      tag = new Tagline(tagG, th.tag);
    }
    var markG = el('g', null, rootG);
    var mark = new Mark(markG, th.mark);
    var sheen = o.sheen === false ? null : new Sheen(st, th.mark, th.sheen);

    // beginpositie van het beeldmerk (gecentreerd in de lock-up)
    var dx0 = 0, dy0 = 0;
    if (shift) {
      if (lockName === 'horizontal') dx0 = (L.w - M.w) / 2 - L.mark[0];
      else dy0 = (L.h - M.h) / 2 - L.mark[1];
    }
    // woordmerk-geometrie in lock-up-coördinaten
    var wb = GEO.word.bbox, wl = 0, wr = 0, wt = 0, wbt = 0, EDGE0 = 0, DW = 0;
    if (hasWord) {
      wl = wb[0] + L.word[0]; wr = wb[2] + L.word[0]; wt = wb[1] + L.word[1]; wbt = wb[3] + L.word[1];
      // schuine lijn die de rechterstip raakt: daarachter komt het woordmerk vandaan
      EDGE0 = M.dots[1].cx + M.dots[1].r * UY - (M.dots[1].cy - M.dots[1].r * UX) * COT + 4;
      DW = wr - (L.mark[0] + dx0 + EDGE0 + wt * COT) + 16;
    }

    var k = o.speed || 1;                                  // interne temposchaal (1 = standaard)
    var T = {};
    T.mark = 0.12;
    T.shift = T.mark + 0.80; T.shiftD = 0.85;
    T.word = hasWord ? (shift ? T.shift + 0.04 : T.mark + 0.62) : 0;
    T.wordD = emerge ? 0.85 : 0.80;
    T.wordEnd = hasWord ? T.word + T.wordD + 0.32 : T.mark + markIntro.dur;
    T.tag = hasTag ? T.word + 0.42 : 0;
    T.tagEnd = hasTag ? T.tag + Tagline.dur : 0;
    T.sheen = Math.max(T.mark + markIntro.dur - 0.25, hasWord ? T.wordEnd - 0.55 : 0);
    T.sheenD = 0.95;
    var rest = Math.max(T.mark + markIntro.dur, T.wordEnd, T.tagEnd, sheen ? T.sheen + T.sheenD : 0);
    var hold = o.hold != null ? o.hold : 1.4;
    var outro = o.outro === false ? 0 : 0.72;
    var tail = o.outro === false ? 0 : (o.gap != null ? o.gap : 0.35);
    var duration = rest + hold + outro + tail;

    function render(t) {
      var tau = t - T.mark, to = t - (rest + hold), out = outro && to > 0;
      // --- beeldmerk
      var stt = tau < 0 ? MARK_NONE : (out ? markOutro(to) : markIntro(tau));
      mark.set(stt);
      var sp = shift ? seg(t, T.shift, T.shiftD, E.inOut) : 1;
      var mdx = dx0 * (1 - sp), mdy = dy0 * (1 - sp);
      sa(markG, 'transform', tr(L.mark[0] + mdx, L.mark[1] + mdy));
      // --- glans
      if (sheen) {
        var gp = seg(t, T.sheen, T.sheenD);
        if (gp > 0 && gp < 1 && !out) { sheen.at(lerp(-150, M.w + 80, E.inOut(gp)), 112); mark.fill(sheen.url); }
        else mark.fill(th.mark);
      }
      // --- woordmerk
      if (hasWord) {
        var dxs = [0, 0, 0, 0, 0], j, pj;
        if (out) {
          // wegvegen: de schuine rand loopt van links naar rechts over de letters
          var op = seg(to, 0.02, 0.46, E.inSoft);
          clip.set(lerp(wl - wbt * COT - 12, wr - wt * COT + 12, op), 1);
          for (j = 0; j < 5; j++) dxs[j] = 22 * seg(to, 0.02 + j * 0.03, 0.4, E.in);
        } else if (emerge) {
          for (j = 0; j < 5; j++) {
            pj = seg(t, T.word + (4 - j) * 0.024, T.wordD, E.inOut);
            dxs[j] = -DW * (1 - pj);
          }
          if (t >= T.wordEnd) clip.off(); else clip.set(L.mark[0] + mdx + EDGE0, 1);
        } else {
          var wp = seg(t, T.word, T.wordD, E.inOut);
          for (j = 0; j < 5; j++) dxs[j] = -28 * (1 - seg(t, T.word + 0.08 + j * 0.06, 0.62, E.out));
          if (t >= T.wordEnd) clip.off();
          else clip.set(lerp(wl - wbt * COT - 34, wr - wt * COT + 12, wp), -1);
        }
        word.shift(dxs);
      }
      // --- tagline
      if (hasTag) tag.set(t - T.tag, out ? 1 - seg(to, 0, 0.3) : 1);
    }
    return { svg: st.svg, duration: duration, rest: rest, render: render, T: T };
  }

  /* 2. WRAP — van lijn naar folie ------------------------------------------ */
  SC.wrap = function (o) {
    var lockName = o.lockup || 'horizontal', L = GEO.lockups[lockName], th = theme(o);
    var lay = layout(o, L.w, L.h, 14);
    var st = Stage(o, lay.W, lay.H, th);
    var rootG = el('g', { transform: 'translate(' + f(lay.ox) + ' ' + f(lay.oy) + ') scale(' + f(lay.s) + ')' }, st.svg);
    var hasWord = !!L.word, hasTag = !!L.tag, sw = o.stroke || 2.8;

    // laag 1: contouren (alleen zichtbaar waar nog geen folie ligt)
    var outG = el('g', { fill: 'none', 'stroke-width': sw, 'stroke-linejoin': 'round' }, rootG);
    var lines = [];
    function addLine(d, color, tx, ty) {
      var n = el('path', { d: d, stroke: color, pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 }, outG);
      if (tx || ty) n.setAttribute('transform', 'translate(' + tx + ' ' + ty + ')');
      lines.push(n);
    }
    var mx = L.mark[0], my = L.mark[1];
    addLine(circleD(M.dots[0].cx, M.dots[0].cy, M.dots[0].r), th.mark, mx, my);
    M.pills.forEach(function (p) { addLine(pillD(p, 0, 1), th.mark, mx, my); });
    addLine(circleD(M.dots[1].cx, M.dots[1].cy, M.dots[1].r), th.mark, mx, my);
    if (hasWord) GEO.word.parts.forEach(function (p) { addLine(p.d, th.word, L.word[0], L.word[1]); });
    var outClip = new SlantClip(st, outG);

    // laag 2: de folie (vulling) + glansrand vlak achter de rakel
    var fillG = el('g', null, rootG);
    var fMarkG = el('g', { transform: tr(mx, my) }, fillG);
    new Mark(fMarkG, th.mark);
    var fWord, hWord;
    if (hasWord) fWord = new Word(el('g', { transform: tr(L.word[0], L.word[1]) }, fillG), th.word);
    var gid = st.id + 'h' + (++uid);
    var lg = el('linearGradient', { id: gid, gradientUnits: 'userSpaceOnUse' }, st.defs);
    var s0 = el('stop', { offset: 0, 'stop-color': '#FFFFFF', 'stop-opacity': 0 }, lg);
    el('stop', { offset: 1, 'stop-color': '#FFFFFF', 'stop-opacity': 0.62 }, lg);
    var hiG = el('g', { fill: 'url(#' + gid + ')' }, fillG);
    var hMark = new Mark(el('g', null, hiG), 'url(#' + gid + ')');
    if (hasWord) hWord = new Word(el('g', null, hiG), 'url(#' + gid + ')');
    var fillClip = new SlantClip(st, fillG);

    var tagG, tag;
    if (hasTag) { tagG = el('g', { transform: tr(L.tag[0], L.tag[1]) }, rootG); tag = new Tagline(tagG, th.tag); }

    var n = lines.length, T = {};
    T.draw = 0.1; T.drawD = 0.8; T.drawStag = 0.055;
    T.drawEnd = T.draw + T.drawD + (n - 1) * T.drawStag;
    T.wipe = T.drawEnd - 0.25; T.wipeD = lockName === 'horizontal' ? 1.15 : 1.0;
    T.tag = hasTag ? T.wipe + T.wipeD * 0.55 : 0;
    var rest = Math.max(T.wipe + T.wipeD, hasTag ? T.tag + Tagline.dur : 0);
    var hold = o.hold != null ? o.hold : 1.4;
    var outro = o.outro === false ? 0 : 0.6;
    var tail = o.outro === false ? 0 : (o.gap != null ? o.gap : 0.35);
    var x0 = -L.h * COT - 70, x1 = L.w + 30, band = 150;

    function render(t) {
      var i, to = t - (rest + hold), out = outro && to > 0;
      for (i = 0; i < n; i++) sa(lines[i], 'stroke-dashoffset', f(1 - seg(t, T.draw + i * T.drawStag, T.drawD, E.inOut)));
      var wp = seg(t, T.wipe, T.wipeD, E.inOut), xe = lerp(x0, x1, wp);
      if (out) {
        // uitgang: folie wordt in dezelfde richting weer weggeveegd
        var op = seg(to, 0, 0.55, E.inSoft), xo = lerp(x0, x1, op);
        sa(outG, 'visibility', 'hidden');
        fillClip.set(xo, 1);
        sa(hiG, 'visibility', 'hidden');
        if (hasTag) tag.set(99, 1 - seg(to, 0, 0.3));
        return;
      }
      sa(outG, 'visibility', wp >= 1 ? 'hidden' : null);
      outClip.set(xe, 1);
      if (wp >= 1) fillClip.off(); else fillClip.set(xe, -1);
      sa(hiG, 'visibility', wp > 0 && wp < 1 ? null : 'hidden');
      // verloop in lock-up-coördinaten: van (rand - band) naar (rand), dwars op de schuinte
      sa(lg, 'x1', f(xe - band * UY)); sa(lg, 'y1', f(band * UX));
      sa(lg, 'x2', f(xe)); sa(lg, 'y2', 0);
      sa(hMark.g, 'transform', tr(mx, my));
      if (hasWord) sa(hWord.g, 'transform', tr(L.word[0], L.word[1]));
      if (hasTag) tag.set(t - T.tag, 1);
    }
    // de glanslaag gebruikt userSpaceOnUse per element: verloop in de ruimte van de groep zetten
    lg.setAttribute('gradientTransform', '');
    if (tr(mx, my)) hMark.g.setAttribute('transform', tr(mx, my));
    return { svg: st.svg, duration: rest + hold + outro + tail, rest: rest, render: render, T: T };
  };

  /* 3. LOADER — doorlopende lus -------------------------------------------- */
  function markLoader(ph) {   // ph = 0..1
    var p = [], k, q, a, b;
    for (k = 0; k < 3; k++) {
      q = ((ph - k * 0.085) % 1 + 1) % 1;
      // rups: kop rolt uit, staart haalt in, en weer terug omhoog
      if (q < 0.25) { a = 0; b = E.inOut(q / 0.25); }
      else if (q < 0.5) { a = E.inOut((q - 0.25) / 0.25); b = 1; }
      else if (q < 0.75) { a = 1 - E.inOut((q - 0.5) / 0.25); b = 1; }
      else { a = 0; b = 1 - E.inOut((q - 0.75) / 0.25); }
      p.push([a, b, 1]);
    }
    function pulse(x) { x = ((x % 1) + 1) % 1; return 1 - 0.2 * Math.pow(Math.sin(Math.PI * x), 2); }
    return { d: [pulse(ph * 2 + 0.25), pulse(ph * 2 - 0.1)], p: p };
  }
  SC.loader = function (o) {
    var th = theme(o), L = GEO.lockups.mark, lay = layout(o, L.w, L.h, 12);
    var st = Stage(o, lay.W, lay.H, th);
    var rootG = el('g', { transform: 'translate(' + f(lay.ox) + ' ' + f(lay.oy) + ') scale(' + f(lay.s) + ')' }, st.svg);
    var mark = new Mark(rootG, th.mark), period = o.period || 2.8;
    return {
      svg: st.svg, duration: period, rest: 0, endless: true, loopDur: period, introDur: 0,
      render: function (t) { mark.set(markLoader(t / period)); }
    };
  };

  /* 4. HOVER — micro-interactie voor de website ----------------------------- */
  function markHover(tau) {
    var p = [], k, q, w = 2 * Math.PI * 2.0, d = 7.2;
    function spring(q) { return q <= 0 ? 0 : Math.sin(w * q) * Math.exp(-d * q); }
    for (k = 0; k < 3; k++) p.push([0, 1 - 0.62 * spring(tau - 0.045 * k), 1]);
    var o0 = spring(tau) * 9, o1 = spring(tau - 0.16) * 9;
    return { d: [1, 1], p: p, o: [[-UX * o0, -UY * o0], [-UX * o1, -UY * o1]] };
  }
  SC.hover = function (o) {
    var lockName = o.lockup || 'horizontal', L = GEO.lockups[lockName], th = theme(o);
    var lay = layout(o, L.w, L.h, 14);
    var st = Stage(o, lay.W, lay.H, th);
    var rootG = el('g', { transform: 'translate(' + f(lay.ox) + ' ' + f(lay.oy) + ') scale(' + f(lay.s) + ')' }, st.svg);
    if (L.word) new Word(el('g', { transform: tr(L.word[0], L.word[1]) }, rootG), th.word);
    if (L.tag) new Tagline(el('g', { transform: tr(L.tag[0], L.tag[1]) }, rootG), th.tag);
    var mark = new Mark(el('g', { transform: tr(L.mark[0], L.mark[1]) }, rootG), th.mark);
    return {
      svg: st.svg, duration: 1.0, rest: 1.0, interactive: true,
      render: function (t) { mark.set(t >= 1 ? MARK_FULL : markHover(t)); }
    };
  };

  /* 5. BADGE — het uitgebreide logo: beeldmerk met draaiende tekstring ------ */
  SC.badge = function (o) {
    var th = theme(o), T = GEO.tag, i, r;
    var tw = T.bbox[2] - T.bbox[0], gap = 96, len = tw + gap, reps = 2, circ = len * reps;
    var R = circ / (2 * Math.PI), cyc = (T.bbox[1] + T.bbox[3]) / 2, capH = T.bbox[3] - T.bbox[1];
    var disc = !!o.disc, outer = R + capH / 2 + (disc ? 46 : 10), pad = o.pad != null ? o.pad : 10;
    var size = 2 * (outer + pad);
    var W = o.frame ? o.frame[0] : size, H = o.frame ? o.frame[1] : size;
    var s = o.frame ? Math.min(W, H) * (o.fit || 0.5) / size : 1;
    var st = Stage(o, W, H, th);
    var rootG = el('g', { transform: 'translate(' + f(W / 2) + ' ' + f(H / 2) + ') scale(' + f(s) + ')' }, st.svg);
    var cDisc = o.discColor || (th === THEMES.mint ? C.mint : th.bg), cMark = th.mark, cText = o.textColor || th.tag, cSep = th.mark;
    if (disc) {
      cDisc = o.discColor || C.mint; cMark = '#FFFFFF'; cText = '#FFFFFF'; cSep = '#FFFFFF';
      if (o.theme === 'dark') { cDisc = C.ink; cMark = C.mint; cText = '#FFFFFF'; cSep = C.mint; }
    }
    var discEl = disc ? el('circle', { cx: 0, cy: 0, r: f(outer), fill: cDisc }, rootG) : null;
    var ring = el('g', null, rootG), glyphs = [], seps = [];
    for (r = 0; r < reps; r++) {
      for (i = 0; i < T.parts.length; i++) {
        var p = T.parts[i], cx = (p.bbox[0] + p.bbox[2]) / 2;
        var ang = ((cx - T.bbox[0]) + r * len) / circ * 360;
        glyphs.push({ n: el('path', { d: p.d, fill: cText, transform: 'rotate(' + f(ang) + ') translate(' + f(-cx) + ' ' + f(-R - cyc) + ')' }, ring), ang: ang });
      }
      var sa2 = (tw + gap / 2 + r * len) / circ * 2 * Math.PI;
      seps.push({ n: el('circle', { cx: f(R * Math.sin(sa2)), cy: f(-R * Math.cos(sa2)), r: 6.2, fill: cSep }, ring), ang: sa2 * 180 / Math.PI });
    }
    var ms = o.markScale || 1.1;
    var markG = el('g', { transform: 'scale(' + ms + ') translate(' + f(-M.w / 2) + ' ' + f(-M.h / 2) + ')' }, rootG);
    var mark = new Mark(markG, cMark);
    var period = o.period || 24, intro = o.intro === false ? 0 : 1.9, start = o.startAngle != null ? o.startAngle : -62;
    return {
      svg: st.svg, duration: intro + period / reps, rest: intro, endless: true, loopDur: period / reps, introDur: intro,
      render: function (t) {
        var j, g, a;
        sa(ring, 'transform', 'rotate(' + f(start + (t / period) * 360) + ')');
        if (intro) {
          if (discEl) sa(discEl, 'r', f(outer * seg(t, 0, 0.6, E.out)));
          mark.set(t < 0.25 ? MARK_NONE : markIntro(t - 0.25));
          for (j = 0; j < glyphs.length; j++) {
            g = glyphs[j]; a = seg(t, 0.55 + (g.ang / 360) * 0.95, 0.3);
            sa(g.n, 'opacity', a >= 1 ? null : f(a));
          }
          for (j = 0; j < seps.length; j++) {
            a = seg(t, 0.55 + (seps[j].ang / 360) * 0.95, 0.35, E.pop);
            sa(seps[j].n, 'r', f(6.2 * Math.max(0, a)));
          }
        } else mark.set(MARK_FULL);
      }
    };
  };

  /* 6. PATROON — het logo als doorlopend merkpatroon ------------------------ */
  function rng(seed) {
    var s = seed >>> 0;
    return function () { s = (s + 0x6D2B79F5) >>> 0; var t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  // Tekent het patroon in parent. W,H in beeldpunten; sc = schaal van de vormen.
  function Pattern(parent, W, H, colors, o) {
    var sc = o.patScale || 1, DX = M.pills[2].tc[0] - M.pills[1].tc[0], S = M.pills[1].S, RW = 61.04;
    var P = 4, slen = Math.sqrt(S[0] * S[0] + S[1] * S[1]);
    var g = el('g', { 'stroke-linecap': 'round', 'stroke-width': RW, fill: 'none' }, parent);
    var w = W / sc, h = H / sc, rand = rng(o.seed || 7), items = [];
    // reeksen per kolom; elk element beslaat L+1 rijen, -1 is een lege plek (1 rij). Elke reeks telt op tot P.
    var seqs = [[0, 2], [1, 1], [0, -1, 1], [1, -1, -1], [2, -1], [0, 1, -1], [3], [0, 0, -1, -1], [1, 0, -1], [-1, 2]];
    var jMin = -P - 1, jMax = Math.ceil(h / S[1]) + P + 1;
    var iMin = Math.floor(-(jMax * S[0]) / DX) - 2, iMax = Math.ceil(w / DX) + Math.ceil(P * S[0] / DX) + 2;
    for (var i = iMin; i <= iMax; i++) {
      var hsh = rng((i + 1000) * 7919 + (o.seed || 7));
      var seq = seqs[Math.floor(hsh() * seqs.length)], off = Math.floor(hsh() * P), j = jMin - off, q = 0;
      while (j <= jMax) {
        var L = seq[q % seq.length];
        if (L < 0) { j += 1; q++; continue; }
        items.push({
          i: i, j: j, L: L, tint: hsh() < 0.5 ? 0 : 1,
          live: L > 0 && hsh() < 0.62, ph: hsh(), n: hsh() < 0.5 ? 1 : 2, key: q % seq.length,
          n1: el('line', { stroke: colors[0] }, g)
        });
        j += L + 1; q++;
      }
    }
    // dezelfde kolom moet per periode identiek zijn (naadloze lus): tint/fase per (kolom, plek in reeks)
    var memo = {};
    items.forEach(function (it) {
      var kk = it.i + ':' + it.key;
      if (!memo[kk]) memo[kk] = { tint: it.tint, live: it.live, ph: it.ph, n: it.n };
      var m = memo[kk];
      it.tint = m.tint; it.live = m.live; it.ph = m.ph; it.n = m.n;
      it.n1.setAttribute('stroke', colors[it.tint]);
    });
    var loop = o.patLoop || 16, drift = o.drift === false ? 0 : 1;
    sa(g, 'transform', 'scale(' + sc + ')');
    this.loop = loop;
    this.render = function (t) {
      var ph = (t / loop) % 1, d = drift * ph * P;      // verschuiving in rijen langs de schuinte
      for (var k2 = 0; k2 < items.length; k2++) {
        var it = items[k2], jj = it.j + d;
        var x1 = it.i * DX + jj * S[0], y1 = jj * S[1];
        var Lc = it.L;
        if (it.live) {
          var c = 0.5 - 0.5 * Math.cos(2 * Math.PI * (ph * it.n + it.ph));
          Lc = it.L * E.inOut(c);
        }
        sa(it.n1, 'x1', f(x1)); sa(it.n1, 'y1', f(y1));
        sa(it.n1, 'x2', f(x1 + Lc * S[0] + 0.001)); sa(it.n1, 'y2', f(y1 + Lc * S[1]));
      }
    };
  }
  SC.patroon = function (o) {
    var th = theme(o), W = o.frame ? o.frame[0] : 1600, H = o.frame ? o.frame[1] : 900;
    var oo = {}; for (var k in o) oo[k] = o[k]; if (oo.bg == null) oo.bg = true;
    var st = Stage(oo, W, H, th);
    st.svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    var pat = new Pattern(st.svg, W, H, o.patColors || th.pat, o);
    return { svg: st.svg, duration: pat.loop, rest: 0, endless: true, loopDur: pat.loop, introDur: 0, render: pat.render };
  };

  /* 7. WISSEL — overgang voor video (met transparantie) ---------------------- */
  SC.wissel = function (o) {
    var th = theme(o), W = o.frame ? o.frame[0] : 1920, H = o.frame ? o.frame[1] : 1080;
    var st = Stage(o, W, H, th);
    var n = o.bands || (W >= H ? 6 : 5), hw = (W + H * COT) / n, r = hw * UY / 2 + 1.5;
    var sA = -(r + 30) / UY, sB = (H + r + 30) / UY;
    var cBand = o.color || C.mint, cUnder = o.under || '#FFFFFF';
    var layers = [{ c: cUnder, dIn: 0, dOut: 0.085 }, { c: cBand, dIn: 0.085, dOut: 0 }];
    if (o.single) layers = [{ c: cBand, dIn: 0, dOut: 0 }];
    var g = el('g', { 'stroke-linecap': 'round', 'stroke-width': f(2 * r), fill: 'none' }, st.svg), bands = [];
    layers.forEach(function (ly) {
      for (var k = 0; k < n; k++) bands.push({ ly: ly, k: k, x0: -H * COT + (k + 0.5) * hw, n: el('line', { stroke: ly.c }, g) });
    });
    var logo = o.logo !== false, mark, markG, ms = Math.min(W * 0.24, H * 0.36) / M.w;
    if (logo) { markG = el('g', null, st.svg); mark = new Mark(markG, '#FFFFFF'); }
    var stag = 0.04, dIn = 0.46, dOut = 0.46, eIn = bezier(0.55, 0, 0.2, 1), eOut = bezier(0.75, 0, 0.45, 1);
    var cover = 0.085 + (n - 1) * stag + dIn, holdD = o.hold != null ? o.hold : (logo ? 0.42 : 0.14);
    var tOut = cover + holdD, total = tOut + 0.085 + (n - 1) * stag + dOut + 0.05;
    return {
      svg: st.svg, duration: total, rest: total, cut: cover + holdD / 2,
      render: function (t) {
        for (var i = 0; i < bands.length; i++) {
          var b = bands[i];
          var lead = lerp(sA, sB, seg(t, b.ly.dIn + b.k * stag, dIn, eIn));
          var tl = lerp(sA, sB, seg(t, tOut + b.ly.dOut + b.k * stag, dOut, eOut));
          if (lead - tl < 0.5) { sa(b.n, 'visibility', 'hidden'); continue; }
          sa(b.n, 'visibility', null);
          sa(b.n, 'x1', f(b.x0 + tl * UX)); sa(b.n, 'y1', f(tl * UY));
          sa(b.n, 'x2', f(b.x0 + lead * UX)); sa(b.n, 'y2', f(lead * UY));
        }
        if (logo) {
          var a = seg(t, cover - 0.22, 0.42, E.out), z = seg(t, tOut - 0.06, 0.2, E.in);
          var sc = ms * lerp(0.9, 1, a) * (1 - 0.12 * z);
          sa(markG, 'opacity', f(Math.min(seg(t, cover - 0.22, 0.2), 1 - z)));
          sa(markG, 'transform', 'translate(' + f(W / 2 - M.w * sc / 2) + ' ' + f(H / 2 - M.h * sc / 2) + ') scale(' + f(sc) + ')');
        }
      }
    };
  };

  /* 8. EINDKAART — afsluiter voor video: patroon + logo-onthulling ----------- */
  SC.eindkaart = function (o) {
    var th = theme({ theme: o.theme || 'mint' }), W = o.frame ? o.frame[0] : 1920, H = o.frame ? o.frame[1] : 1080;
    var st = Stage({ bg: true, frame: [W, H], label: o.label }, W, H, th);
    // patroon, met een rustige zone rond het logo
    var mid = st.id + 'm';
    var rg = el('radialGradient', { id: mid + 'g', gradientUnits: 'userSpaceOnUse', cx: f(W / 2), cy: f(H / 2), r: f(Math.max(W, H) * 0.62) }, st.defs);
    el('stop', { offset: 0, 'stop-color': '#000' }, rg);
    el('stop', { offset: 0.42, 'stop-color': '#000' }, rg);
    el('stop', { offset: 1, 'stop-color': '#fff' }, rg);
    var mask = el('mask', { id: mid, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: f(W), height: f(H) }, st.defs);
    el('rect', { x: 0, y: 0, width: f(W), height: f(H), fill: 'url(#' + mid + 'g)' }, mask);
    var patG = el('g', { mask: 'url(#' + mid + ')' }, st.svg);
    var pat = new Pattern(patG, W, H, o.patColors || th.pat, { patScale: o.patScale || Math.max(W, H) / 1500, patLoop: o.patLoop || 16, seed: o.seed || 11 });
    var lockName = o.lockup || 'tagline', L = GEO.lockups[lockName];
    var s = Math.min(W * (o.fit || (W >= H ? 0.4 : 0.66)) / L.w, H * 0.5 / L.h);
    var rootG = el('g', { transform: 'translate(' + f((W - L.w * s) / 2) + ' ' + f((H - L.h * s) / 2) + ') scale(' + f(s) + ')' }, st.svg);
    var u = uitrolInto(st, rootG, L, lockName, th, { outro: false, hold: 0, shift: true });
    var t0 = 0.35, hold = o.hold != null ? o.hold : 2.6;
    return {
      svg: st.svg, duration: t0 + u.rest + hold, rest: t0 + u.rest,
      render: function (t) { pat.render(t); u.render(t - t0); }
    };
  };

  /* 9. KLEURWISSEL — het beeldmerk wordt telkens opnieuw gewrapt ------------- */
  SC.kleurwissel = function (o) {
    var lockName = o.lockup || 'mark', L = GEO.lockups[lockName], th = theme(o);
    var lay = layout(o, L.w, L.h, 14);
    var st = Stage(o, lay.W, lay.H, th);
    var rootG = el('g', { transform: 'translate(' + f(lay.ox) + ' ' + f(lay.oy) + ') scale(' + f(lay.s) + ')' }, st.svg);
    if (L.word) new Word(el('g', { transform: tr(L.word[0], L.word[1]) }, rootG), th.word);
    var cols = o.colors || [C.mint, '#3A4045', '#D9D2C5', '#1D1D1F', '#5B6E63'];
    var mg = el('g', { transform: tr(L.mark[0], L.mark[1]) }, rootG);
    var base = new Mark(mg, cols[0]), top = new Mark(mg, cols[1]);
    var step = o.step || 2.3, n = cols.length;
    return {
      svg: st.svg, duration: step * n, rest: 0, endless: true, loopDur: step * n, introDur: 0, colors: cols,
      render: function (t) {
        var idx = Math.floor(t / step) % n, tau = t - Math.floor(t / step) * step, k, p = [];
        var t0 = step - 1.25;   // eerst even stilstaan, dan opnieuw wrappen
        // zodra de nieuwe laag er helemaal op ligt, neemt de onderlaag de kleur over (geen randje)
        base.fill(cols[tau >= t0 + 1.14 ? (idx + 1) % n : idx]); top.fill(cols[(idx + 1) % n]);
        for (k = 0; k < 3; k++) p.push([0, seg(tau, t0 + 0.12 + 0.09 * k, 0.8, E.rollFlat), tau > t0 + 0.06 + 0.09 * k ? 1 : 0]);
        top.set({ d: [seg(tau, t0, 0.5, E.out), seg(tau, t0 + 0.62, 0.5, E.out)], p: p });
      }
    };
  };


  /* 10. KOZIJN — idee voor de website: de rakel wrapt een kozijn in een nieuwe kleur -- */
  SC.kozijn = function (o) {
    var W = o.frame ? o.frame[0] : 1280, H = o.frame ? o.frame[1] : 800, th = theme(o);
    var st = Stage({ label: 'Een kozijn krijgt een nieuwe kleur', frame: o.frame }, W, H, th);
    el('rect', { x: 0, y: 0, width: f(W), height: f(H), fill: o.wall || '#EDF1EF' }, st.svg);
    var bw = 600, bh = 500, s = Math.min(W * 0.64 / bw, H * 0.86 / bh);
    var g = el('g', { transform: 'translate(' + f((W - bw * s) / 2) + ' ' + f((H - bh * s) / 2) + ') scale(' + f(s) + ')' }, st.svg);
    var OX = 40, OY = 16, OW = 520, OH = 440;
    var panes = [[74, 50, 452, 122], [74, 198, 213, 224], [313, 198, 213, 224]], sash = 16;
    function rr(x, y, w, h, r) {
      return 'M' + (x + r) + ' ' + y + 'h' + (w - 2 * r) + 'a' + r + ' ' + r + ' 0 0 1 ' + r + ' ' + r + 'v' + (h - 2 * r) +
        'a' + r + ' ' + r + ' 0 0 1 ' + (-r) + ' ' + r + 'h' + (-(w - 2 * r)) + 'a' + r + ' ' + r + ' 0 0 1 ' + (-r) + ' ' + (-r) +
        'v' + (-(h - 2 * r)) + 'a' + r + ' ' + r + ' 0 0 1 ' + r + ' ' + (-r) + 'Z';
    }
    var p3 = panes[2], hole3 = [p3[0] + sash, p3[1] + sash, p3[2] - 2 * sash, p3[3] - 2 * sash];
    var holes = [panes[0], panes[1], hole3];
    var frameD = rr(OX, OY, OW, OH, 16) + holes.map(function (q) { return rr(q[0], q[1], q[2], q[3], 5); }).join('');
    // muuropening + vensterbank
    el('rect', { x: OX - 8, y: OY - 8, width: OW + 16, height: OH + 12, rx: 22, fill: '#DFE6E3' }, g);
    // glas met spiegeling onder de logo-hoek
    var gid = st.id + 'gl';
    var gg = el('linearGradient', { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 }, st.defs);
    el('stop', { offset: 0, 'stop-color': '#E2EEEF' }, gg);
    el('stop', { offset: 1, 'stop-color': '#C6D9DB' }, gg);
    holes.forEach(function (q) { el('rect', { x: q[0] - 2, y: q[1] - 2, width: q[2] + 4, height: q[3] + 4, fill: 'url(#' + gid + ')' }, g); });
    var cid = st.id + 'gc', cp = el('clipPath', { id: cid }, st.defs);
    holes.forEach(function (q) { el('rect', { x: q[0], y: q[1], width: q[2], height: q[3] }, cp); });
    var refl = el('g', { 'clip-path': 'url(#' + cid + ')', fill: '#FFFFFF' }, g);
    [[118, 58, 0.42], [196, 16, 0.3], [372, 44, 0.36], [434, 12, 0.26]].forEach(function (r) {
      var x = r[0] - OY * COT, sl = (OH + 2 * OY) * COT;
      el('polygon', { points: f(x) + ',0 ' + f(x + r[1]) + ',0 ' + f(x + r[1] + sl) + ',' + (OH + 2 * OY) + ' ' + f(x + sl) + ',' + (OH + 2 * OY), opacity: r[2] }, refl);
    });
    // het kozijn: onderlaag (huidige kleur) en bovenlaag (nieuwe folie) met glansrand
    var cols = o.colors || [['#E3DAC6', 'Crème'], ['#3B4247', 'Antraciet'], ['#1F2022', 'Zwart'], ['#8C9395', 'Grijs'], ['#31493E', 'Groen'], ['#F4F3EE', 'Wit']];
    var n = cols.length;
    var base = el('path', { d: frameD, 'fill-rule': 'evenodd', fill: cols[0][0] }, g);
    var topG = el('g', null, g);
    var top = el('path', { d: frameD, 'fill-rule': 'evenodd', fill: cols[1][0] }, topG);
    var hid = st.id + 'kh', hg = el('linearGradient', { id: hid, gradientUnits: 'userSpaceOnUse' }, st.defs);
    el('stop', { offset: 0, 'stop-color': '#FFFFFF', 'stop-opacity': 0 }, hg);
    el('stop', { offset: 1, 'stop-color': '#FFFFFF', 'stop-opacity': 0.5 }, hg);
    var hi = el('path', { d: frameD, 'fill-rule': 'evenodd', fill: 'url(#' + hid + ')' }, topG);
    var clip = new SlantClip(st, topG);
    // details die op elke kleur werken
    var det = el('g', { fill: 'none' }, g);
    holes.forEach(function (q) { el('rect', { x: q[0], y: q[1], width: q[2], height: q[3], rx: 5, stroke: '#000000', 'stroke-opacity': 0.16, 'stroke-width': 2 }, det); });
    el('rect', { x: p3[0], y: p3[1], width: p3[2], height: p3[3], rx: 5, stroke: '#000000', 'stroke-opacity': 0.2, 'stroke-width': 1.5 }, det);
    el('rect', { x: OX + 0.75, y: OY + 0.75, width: OW - 1.5, height: OH - 1.5, rx: 15.5, stroke: '#000000', 'stroke-opacity': 0.1, 'stroke-width': 1.5 }, det);
    el('rect', { x: p3[0] + 3.5, y: p3[1] + p3[3] / 2 - 21, width: 9, height: 42, rx: 4.5, fill: '#A4ADAF' }, g);
    el('rect', { x: 20, y: OY + OH, width: 560, height: 20, rx: 5, fill: '#CBD2D0' }, g);
    el('rect', { x: 32, y: OY + OH + 20, width: 536, height: 6, rx: 3, fill: '#000000', opacity: 0.06 }, g);
    // de rakel: een baan uit het logo
    var rakel = el('line', { stroke: C.mint, 'stroke-linecap': 'round' }, g);
    var step = o.step || 3.2, wipe0 = 1.25, wipeD = 1.3, x0 = -(OY + OH) * COT - 34, x1 = OX + OW + 34 - OY * COT;
    var plan = { t0: 0, seq: null, base: 0 };
    function at(t) {
      var k = Math.max(0, Math.floor((t - plan.t0) / step)), tau = (t - plan.t0) - k * step, a, b;
      if (plan.seq) { a = k === 0 ? plan.seq[0] : (plan.seq[1] + k - 1) % n; b = (plan.seq[1] + k) % n; }
      else { a = (plan.base + k) % n; b = (plan.base + k + 1) % n; }
      return { a: a, b: b, tau: tau, p: seg(tau, wipe0, wipeD, E.inOut) };
    }
    var last = { cur: 0 };
    function render(t) {
      var q = at(t), xe = lerp(x0, x1, q.p), on = q.p > 0 && q.p < 1;
      sa(base, 'fill', cols[q.p >= 1 ? q.b : q.a][0]);
      sa(top, 'fill', cols[q.b][0]);
      sa(topG, 'visibility', on ? null : 'hidden');
      last.cur = q.p >= 0.5 ? q.b : q.a;
      if (on) {
        clip.set(xe, -1);
        sa(hg, 'x1', f(xe - 120 * UY)); sa(hg, 'y1', f(120 * UX)); sa(hg, 'x2', f(xe)); sa(hg, 'y2', 0);
      }
      var kk = Math.min(seg(q.tau, wipe0 - 0.12, 0.3, E.out), 1 - seg(q.tau, wipe0 + wipeD - 0.2, 0.3, E.in));
      if (kk <= 0.001) sa(rakel, 'visibility', 'hidden');
      else {
        var ya = OY - 22, yb = OY + OH + 22;
        sa(rakel, 'visibility', null);
        sa(rakel, 'stroke-width', f(24 * kk));
        sa(rakel, 'x1', f(xe + ya * COT)); sa(rakel, 'y1', ya);
        sa(rakel, 'x2', f(xe + yb * COT)); sa(rakel, 'y2', yb);
      }
    }
    return {
      svg: st.svg, duration: step * n, rest: 0, endless: true, loopDur: step * n, introDur: 0, colors: cols, render: render,
      // kies een kleur: de rakel begint meteen, daarna loopt de reeks vanzelf verder
      pick: function (i, t) { plan = { t0: t - wipe0 + 0.1, seq: [last.cur, i], base: 0 }; },
      current: function () { return last.cur; }
    };
  };


  /* ====================================================================== FILM
   * "Van aanvraag tot afgeleverd kozijn" — animatie voor iwrap.nl.
   * Ontwerpruimte 1920 x 1080. Alles is een pure functie van de tijd, zodat de film
   * beeld voor beeld gerenderd kan worden.
   * ====================================================================== */

  var NL = {"land":[[[348.4,-328.5],[348.4,-310.5],[344.2,-296.4],[346.6,-286.5],[348.1,-254.4],[342.4,-234.9],[327.3,-211.2],[324.0,-202.2],[319.4,-149.1],[315.9,-142.8],[306.7,-146.1],[297.5,-144.6],[287.8,-147.6],[264.2,-145.5],[257.8,-140.7],[259.3,-137.7],[258.2,-129.9],[265.5,-123.0],[252.3,-117.6],[256.5,-97.8],[260.2,-93.6],[294.2,-84.6],[303.6,-86.1],[307.6,-90.3],[321.4,-64.5],[319.9,-53.7],[314.8,-40.5],[317.4,-24.3],[309.3,-19.2],[299.3,-6.6],[291.4,-3.0],[281.5,11.1],[266.6,14.1],[259.4,24.9],[253.7,27.0],[252.5,30.0],[252.8,34.5],[271.8,44.7],[277.5,51.0],[277.8,56.7],[265.5,72.6],[260.5,75.3],[244.2,75.6],[226.0,82.2],[213.8,90.6],[198.2,87.0],[198.9,96.6],[192.1,98.7],[191.6,93.9],[181.5,91.2],[177.4,85.2],[170.1,86.1],[152.1,75.9],[145.8,79.5],[157.4,92.4],[144.2,88.8],[116.0,100.2],[115.5,102.9],[119.7,106.2],[122.1,111.9],[121.7,118.2],[117.7,122.1],[117.5,125.4],[124.7,126.0],[130.9,130.2],[132.8,132.0],[130.4,140.7],[134.4,146.1],[146.9,151.8],[143.8,162.6],[144.5,166.2],[164.2,192.3],[166.4,207.6],[164.2,225.3],[167.0,228.6],[164.4,241.5],[155.9,249.6],[140.7,275.4],[139.2,281.4],[139.9,293.7],[144.2,296.1],[153.3,289.8],[157.6,291.3],[151.9,295.5],[155.7,299.4],[125.6,322.5],[117.3,335.7],[114.0,336.0],[106.6,329.4],[101.5,332.1],[105.7,355.5],[115.5,351.6],[122.8,353.7],[129.4,352.8],[128.7,366.3],[140.5,372.6],[139.2,389.1],[137.2,391.8],[130.4,393.0],[128.3,404.7],[125.8,407.4],[123.0,406.5],[128.2,416.1],[127.8,420.0],[90.6,419.4],[83.1,413.1],[78.7,418.8],[74.8,418.8],[71.3,416.7],[73.5,406.2],[62.7,400.5],[59.6,396.0],[59.2,389.1],[72.4,373.8],[77.6,371.4],[85.3,357.3],[77.6,357.3],[87.9,337.8],[85.3,334.5],[86.6,327.6],[90.3,328.5],[91.8,326.7],[94.1,320.4],[92.9,315.9],[100.4,314.1],[96.2,309.3],[99.5,303.3],[97.3,298.2],[88.4,299.4],[79.2,289.8],[66.0,291.3],[59.8,285.9],[49.3,282.6],[45.2,279.0],[43.2,266.4],[35.5,258.9],[31.6,258.6],[16.4,267.3],[-15.6,267.3],[-15.6,256.8],[-18.9,252.6],[-29.4,252.9],[-32.5,251.1],[-36.2,239.7],[-42.7,232.5],[-43.2,223.2],[-40.5,213.3],[-44.1,206.4],[-50.0,201.9],[-53.0,202.8],[-63.1,221.7],[-71.7,227.4],[-82.2,223.2],[-98.9,221.1],[-97.8,217.5],[-95.8,217.2],[-87.7,220.8],[-89.2,215.7],[-87.5,202.2],[-95.8,196.5],[-104.6,199.2],[-118.8,217.2],[-123.2,219.6],[-139.6,219.0],[-143.1,216.3],[-141.0,204.6],[-142.5,202.2],[-150.2,202.8],[-169.7,212.1],[-167.5,214.5],[-169.2,222.0],[-162.5,232.8],[-163.5,237.9],[-167.0,240.0],[-175.4,239.4],[-185.7,234.3],[-191.0,234.3],[-194.0,220.8],[-195.8,219.3],[-202.1,223.5],[-218.6,222.9],[-239.2,209.1],[-246.9,208.2],[-257.1,223.5],[-270.8,227.7],[-296.0,208.8],[-310.7,211.5],[-324.5,207.3],[-331.9,194.7],[-340.0,186.0],[-340.7,181.2],[-338.7,178.5],[-319.9,166.5],[-270.5,161.1],[-263.7,163.5],[-258.2,169.8],[-256.3,174.3],[-262.6,180.3],[-245.1,182.1],[-236.1,185.7],[-228.6,192.6],[-219.7,211.2],[-205.8,211.2],[-202.3,213.0],[-187.0,210.6],[-184.4,203.7],[-185.9,197.4],[-189.8,192.6],[-210.9,184.5],[-222.3,184.5],[-241.2,168.0],[-226.5,161.7],[-210.2,162.6],[-201.0,168.0],[-204.1,159.9],[-214.0,159.0],[-218.3,153.3],[-218.3,143.7],[-212.7,139.8],[-206.5,139.2],[-213.1,133.8],[-225.8,129.9],[-232.8,109.8],[-242.5,102.0],[-245.8,104.7],[-262.6,108.6],[-264.4,100.2],[-245.8,90.9],[-236.1,91.8],[-230.2,94.8],[-224.7,91.8],[-233.1,80.4],[-231.1,72.3],[-237.2,51.0],[-236.1,48.6],[-235.0,46.8],[-226.3,48.6],[-219.2,47.4],[-212.9,43.2],[-186.6,11.1],[-164.2,-21.9],[-145.6,-55.8],[-129.3,-107.1],[-116.0,-194.1],[-108.1,-213.9],[-105.5,-236.4],[-102.0,-245.4],[-90.6,-243.6],[-88.8,-245.4],[-87.5,-243.0],[-90.3,-234.0],[-85.9,-228.3],[-78.3,-226.2],[-71.2,-226.8],[-59.2,-235.8],[-40.8,-241.2],[2.4,-279.9],[14.5,-284.1],[27.0,-321.3],[37.5,-332.1],[44.3,-335.1],[53.7,-345.9],[66.2,-348.6],[72.6,-354.0],[125.2,-376.8],[179.1,-378.9],[186.1,-374.7],[192.3,-378.9],[219.5,-386.7],[262.9,-393.3],[281.1,-390.3],[288.1,-385.2],[294.4,-360.6],[303.2,-352.8],[316.3,-346.8],[319.6,-348.0],[323.2,-345.6],[328.2,-348.0],[326.0,-343.8],[327.5,-335.1],[348.4,-328.5]],[[-358.7,232.5],[-323.4,219.9],[-311.7,227.7],[-293.8,232.8],[-283.9,240.0],[-269.6,242.1],[-247.1,233.4],[-242.0,222.0],[-233.7,223.8],[-226.2,233.7],[-216.6,237.3],[-210.2,237.6],[-205.9,231.9],[-198.4,234.6],[-200.8,245.7],[-208.0,255.9],[-217.2,263.4],[-240.0,275.1],[-248.4,281.7],[-274.2,283.5],[-279.3,279.0],[-280.2,268.5],[-310.7,258.0],[-328.4,260.7],[-330.4,262.8],[-330.8,273.0],[-339.4,274.2],[-350.8,270.9],[-355.4,266.1],[-358.0,258.3],[-357.1,243.9],[-358.7,232.5]],[[-232.2,139.2],[-221.2,144.0],[-220.8,148.8],[-222.7,151.8],[-228.9,155.1],[-246.4,157.8],[-257.1,152.4],[-260.0,144.6],[-270.1,139.2],[-274.2,135.0],[-276.5,135.0],[-282.2,141.6],[-294.2,140.7],[-296.6,137.1],[-296.2,127.5],[-289.4,123.0],[-273.2,120.6],[-250.1,122.7],[-243.1,126.0],[-232.2,139.2]],[[-74.8,-288.3],[-74.8,-286.5],[-71.2,-286.5],[-74.8,-277.8],[-80.0,-270.0],[-88.6,-263.1],[-92.7,-255.0],[-98.9,-253.2],[-105.4,-255.9],[-108.9,-263.4],[-104.1,-280.2],[-99.7,-287.4],[-90.8,-294.9],[-82.0,-311.4],[-76.1,-311.1],[-75.4,-309.3],[-76.1,-304.8],[-71.7,-295.5],[-71.7,-290.7],[-74.8,-288.3]],[[-77.4,-321.3],[-57.6,-342.0],[-45.2,-349.2],[-35.9,-348.0],[-35.9,-345.9],[-40.8,-345.9],[-48.5,-342.6],[-71.7,-318.6],[-77.4,-321.3]],[[22.8,-384.0],[25.2,-385.8],[52.4,-391.2],[48.2,-385.2],[32.2,-383.1],[33.5,-378.9],[31.1,-377.7],[23.4,-376.8],[-16.9,-360.9],[-22.1,-360.9],[-24.3,-365.4],[-22.2,-370.5],[-12.5,-374.1],[-9.2,-376.8],[19.7,-381.9],[22.8,-384.0]],[[68.8,-395.4],[112.9,-397.2],[120.4,-393.3],[102.2,-389.1],[83.3,-389.1],[69.7,-384.0],[65.1,-385.2],[61.8,-389.7],[62.9,-393.9],[66.0,-396.6],[68.8,-395.4]],[[167.7,-407.7],[185.9,-409.2],[191.0,-407.7],[191.0,-405.6],[156.8,-395.7],[153.2,-391.2],[151.3,-399.6],[155.9,-403.5],[167.7,-407.7]],[[209.8,-422.1],[222.5,-418.2],[219.9,-415.8],[213.5,-417.9],[209.8,-422.1]]],"lake":[[104.8,-117.0],[105.5,-111.3],[105.4,-105.3],[103.2,-98.4],[99.7,-92.4],[92.1,-81.9],[88.1,-77.4],[82.2,-72.9],[75.8,-69.9],[65.1,-66.6],[59.6,-61.8],[51.1,-51.9],[45.0,-37.8],[42.8,-35.4],[27.0,-31.5],[19.3,-32.1],[11.2,-36.0],[-5.9,-48.6],[-9.6,-48.9],[-17.5,-48.0],[-21.9,-48.6],[-25.2,-50.1],[-34.6,-56.4],[-38.2,-57.6],[-46.5,-58.5],[-49.5,-59.4],[-61.0,-66.3],[-58.5,-70.5],[-53.5,-68.4],[-50.6,-68.4],[-47.4,-76.2],[-43.2,-79.2],[-38.2,-86.7],[-43.8,-93.3],[-46.0,-95.1],[-40.8,-96.9],[-42.1,-101.4],[-38.4,-105.3],[-39.9,-112.8],[-46.0,-126.0],[-48.5,-135.0],[-48.7,-142.5],[-46.0,-147.6],[-39.5,-148.5],[-30.0,-142.5],[-24.6,-144.0],[-13.4,-150.9],[-10.5,-154.5],[-8.1,-161.7],[0.7,-167.1],[-1.1,-177.9],[-11.8,-183.6],[-19.3,-182.4],[-23.9,-178.8],[-30.0,-183.6],[-32.5,-187.5],[-33.1,-206.7],[-34.0,-213.3],[-43.2,-231.9],[-47.1,-235.2],[-39.3,-238.2],[-31.4,-243.0],[-2.2,-268.5],[13.2,-278.1],[16.5,-268.8],[20.0,-264.6],[20.8,-257.1],[19.5,-253.5],[22.1,-245.4],[21.3,-240.6],[18.4,-237.0],[20.8,-232.2],[16.2,-228.3],[12.1,-223.5],[12.1,-220.5],[16.4,-215.4],[20.4,-212.1],[26.1,-210.6],[37.9,-210.3],[44.5,-206.7],[50.4,-206.4],[56.3,-210.3],[62.1,-211.5],[75.4,-207.6],[77.6,-206.1],[71.0,-204.9],[65.5,-201.0],[61.0,-195.0],[57.4,-187.5],[55.7,-180.0],[54.4,-167.7],[54.8,-156.0],[58.1,-150.6],[64.7,-140.7],[69.3,-137.7],[93.6,-138.9],[99.5,-136.2],[102.6,-128.1]],"flevo":[[87.3,-129.0],[96.0,-126.0],[100.4,-118.5],[101.1,-106.5],[98.9,-97.5],[94.7,-90.6],[87.9,-82.5],[81.8,-77.1],[74.5,-73.8],[64.4,-70.8],[57.4,-65.7],[48.7,-56.1],[42.3,-42.9],[36.8,-37.5],[26.7,-35.4],[18.4,-36.0],[10.1,-40.2],[0.0,-47.1],[-7.0,-52.2],[-15.6,-52.8],[-23.9,-54.0],[-30.3,-59.4],[-34.9,-66.6],[-30.3,-72.6],[-18.4,-78.6],[-1.8,-89.4],[12.9,-102.6],[23.0,-113.4],[31.3,-120.9],[44.1,-129.0],[57.0,-132.0],[73.5,-130.5]],"cities":{"Hilversum":[-22.8,-22.2],"Amsterdam":[-74.5,-66.0],"Haarlem":[-120.3,-71.1],"Alkmaar":[-101.3,-144.6],"Hoorn":[-44.3,-147.6],"Utrecht":[-32.7,17.7],"Amersfoort":[16.0,-1.8],"Apeldoorn":[123.2,-18.3],"Arnhem":[112.3,49.5],"Nijmegen":[103.9,92.4],"Zutphen":[164.7,2.1],"Rotterdam":[-151.0,68.4],"Den Haag":[-183.9,24.0],"Leiden":[-147.6,-3.0],"Dordrecht":[-112.2,101.1],"Eindhoven":[32.9,212.7],"Tilburg":[-38.4,178.2],"Breda":[-96.3,168.3],"Den Bosch":[0.9,138.0],"Middelburg":[-310.6,195.3],"Goes":[-259.4,193.8],"Terneuzen":[-270.7,244.2],"Zwolle":[146.0,-109.8],"Enschede":[293.1,-21.3],"Deventer":[158.7,-31.5],"Almere":[-14.3,-66.3],"Lelystad":[31.4,-110.4],"Groningen":[233.0,-320.7],"Leeuwarden":[91.8,-315.3],"Assen":[232.0,-252.9],"Maastricht":[71.7,389.7],"Venlo":[160.3,234.0],"Roermond":[126.5,286.8],"Harderwijk":[58.8,-57.6],"Ede":[67.3,33.0],"Helmond":[66.4,200.7],"Gouda":[-108.9,41.7],"Zeist":[-12.3,18.3],"Purmerend":[-62.7,-106.5],"Vlissingen":[-317.5,212.4]},"route":[[-22.8,-22.2],[0.0,-10.5],[18.4,-9.0],[40.5,-31.5],[62.5,-55.5],[97.5,-84.0],[137.9,-105.0],[152.6,-123.0],[165.5,-165.0],[189.4,-195.0],[226.2,-243.0],[235.4,-282.0],[233.0,-320.7]],"bbox":[-358.7,-422.1,348.4,420.0]};
  var FONT = "Montserrat, 'Avenir Next', 'Segoe UI', sans-serif";
  var K = {
    paper: '#F7F6F3', ink: '#22262A', inkSoft: '#3A4047', sub: '#646B73', mint: C.mint, mintSoft: '#DBECE7',
    mintWash: '#EEF6F3', mintDeep: '#2F5A50', mintInk: '#3F7468', rust: '#A8523A', gold: '#D9940A',
    brick: '#C27A5C', brickDark: '#AE6A4E', roof: '#3A4047', roofLite: '#4B535A',
    creamOld: '#CFBF96', creamOldDark: '#B5A377', creamNew: '#F3E9D4', glue: '#E3B93F', profile: '#E3E7E8',
    glass1: '#DDEAEC', glass2: '#BFD4D8', skin: '#F0C6A2', hair: '#5B3D2A', mustard: '#D9A441',
    road: '#D6D4CD', walk: '#E9E7E1', hedge: '#7DAE92', hedge2: '#96C3A8', alu: '#B9C3C6', aluDark: '#8B979B', tile: '#8A4636'
  };

  function A(node, attrs) { for (var k in attrs) node.setAttribute(k, attrs[k]); return node; }
  function Rc(p, x, y, w, h, rx, fill, extra) { var n = el('rect', { x: f(x), y: f(y), width: f(w), height: f(h), rx: f(rx || 0), fill: fill }, p); return extra ? A(n, extra) : n; }
  function Ci(p, cx, cy, r, fill, extra) { var n = el('circle', { cx: f(cx), cy: f(cy), r: f(r), fill: fill }, p); return extra ? A(n, extra) : n; }
  function Li(p, x1, y1, x2, y2, stroke, sw, extra) { var n = el('line', { x1: f(x1), y1: f(y1), x2: f(x2), y2: f(y2), stroke: stroke, 'stroke-width': sw, 'stroke-linecap': 'round' }, p); return extra ? A(n, extra) : n; }
  function Pa(p, d, fill, extra) { var n = el('path', { d: d, fill: fill }, p); return extra ? A(n, extra) : n; }
  function Tx(p, str, x, y, size, weight, fill, anchor, ls) {
    var n = el('text', { x: f(x), y: f(y), 'font-family': FONT, 'font-size': size, 'font-weight': weight, fill: fill, 'text-anchor': anchor || 'start' }, p);
    if (ls) n.setAttribute('letter-spacing', ls);
    n.textContent = str;
    return n;
  }
  function G(p, extra) { return el('g', extra || null, p); }
  function op(n, v) { sa(n, 'opacity', v >= 0.999 ? null : f(Math.max(0, v))); sa(n, 'visibility', v <= 0.001 ? 'hidden' : null); }
  function show(n, on) { sa(n, 'visibility', on ? null : 'hidden'); }
  function rad(d) { return d * Math.PI / 180; }
  // sleutelwaarden: kf(t, [[t0, v0], [t1, v1], ...]) met vloeiende overgang per stuk
  function kf(t, pts, e) {
    if (t <= pts[0][0]) return pts[0][1];
    for (var i = 1; i < pts.length; i++) {
      if (t <= pts[i][0]) return lerp(pts[i - 1][1], pts[i][1], (pts[i][2] || e || E.inOut)(clamp((t - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0]), 0, 1)));
    }
    return pts[pts.length - 1][1];
  }
  // pop: schaal van 0 naar 1 met lichte doorveer
  function pop(t, t0, d) { return seg(t, t0, d || 0.45, E.pop); }
  function textW(n, str, size) {
    try { if (n.isConnected && n.getComputedTextLength) { var w = n.getComputedTextLength(); if (w > 0) return w; } } catch (e) {}
    return str.length * size * 0.6;
  }

  /* --- ondertitel-pil: rolt uit vanuit een stip, net als het logo --- */
  function Captions(parent, list) {
    var g = G(parent), items = [];
    list.forEach(function (c) {
      var ig = G(g), size = 36, h = 84, cy = 968;
      var sh = Rc(ig, 0, cy - h / 2 + 8, h, h, h / 2, '#22262A', { opacity: 0.1 });
      var pill = Rc(ig, 0, cy - h / 2, h, h, h / 2, '#FFFFFF');
      var dot = Ci(ig, 0, cy, 11, K.mint);
      var txt = Tx(ig, c.text, 0, cy + size * 0.355, size, 600, K.ink, 'start');
      items.push({ c: c, g: ig, sh: sh, pill: pill, dot: dot, txt: txt, h: h, size: size, w: 0, fonts: -1 });
    });
    this.render = function (t) {
      var fv = (document.fonts && document.fonts.status === 'loaded') ? document.fonts.size : 0;
      for (var i = 0; i < items.length; i++) {
        var it = items[i], c = it.c;
        if (t < c.t0 - 0.05 || t > c.t1 + 0.5) { show(it.g, false); continue; }
        show(it.g, true);
        if (it.fonts !== fv || !it.w) { it.w = textW(it.txt, c.text, it.size); it.fonts = fv; }
        var full = it.w + it.h + 58, a = seg(t, c.t0, 0.6, E.out), z = seg(t, c.t1, 0.4, E.in);
        var w = lerp(it.h, full, a) * (1 - z) + it.h * z, x = 960 - w / 2, s = pop(t, c.t0, 0.35) * (1 - seg(t, c.t1 + 0.25, 0.2, E.in));
        sa(it.pill, 'x', f(x)); sa(it.pill, 'width', f(w));
        sa(it.sh, 'x', f(x)); sa(it.sh, 'width', f(w));
        sa(it.dot, 'cx', f(x + it.h / 2));
        sa(it.txt, 'x', f(x + it.h - 6));
        op(it.txt, seg(t, c.t0 + 0.28, 0.3) * (1 - seg(t, c.t1 - 0.05, 0.22)));
        sa(it.g, 'transform', s >= 0.999 ? null : 'translate(960 968) scale(' + f(s) + ') translate(-960 -968)');
      }
    };
  }

  /* --- staande versie: ondertitels als grote regels onder het beeld --- */
  function vlines(text) {
    var out = [], parts = text.split('. '), i, pt, k;
    for (i = 0; i < parts.length; i++) {
      pt = parts[i] + (i < parts.length - 1 ? '.' : '');
      k = pt.indexOf(', ');
      if (pt.length > 30 && k > 0) { out.push(pt.slice(0, k + 1)); out.push(pt.slice(k + 2)); } else out.push(pt);
    }
    // nog steeds te lang voor het staande beeld: afbreken bij de spatie het dichtst bij het midden
    return out.reduce(function (acc, s) {
      if (s.length <= 34) { acc.push(s); return acc; }
      var best = -1, mid = s.length / 2;
      for (var j = 0; j < s.length; j++) if (s.charAt(j) === ' ' && (best < 0 || Math.abs(j - mid) < Math.abs(best - mid))) best = j;
      if (best < 0) acc.push(s); else { acc.push(s.slice(0, best)); acc.push(s.slice(best + 1)); }
      return acc;
    }, []);
  }
  function CaptionsV(parent, list, y0) {
    var g = G(parent), items = list.map(function (c) {
      var ig = G(g), lines = vlines(c.text);
      return { c: c, g: ig, dot: Ci(ig, 540, y0 - 84, 10, K.mint), n: lines.map(function (s, i) { return Tx(ig, s, 540, y0 + i * 72, 52, 600, K.ink, 'middle'); }) };
    });
    this.render = function (t) {
      items.forEach(function (it) {
        var c = it.c, on = t > c.t0 - 0.05 && t < c.t1 + 0.45, z = seg(t, c.t1, 0.35);
        show(it.g, on);
        if (!on) return;
        sa(it.dot, 'r', f(10 * pop(t, c.t0, 0.4) * (1 - z)));
        it.n.forEach(function (n, i) {
          var a = seg(t, c.t0 + 0.12 + i * 0.1, 0.55, E.out);
          op(n, Math.min(seg(t, c.t0 + 0.12 + i * 0.1, 0.3), 1 - z));
          sa(n, 'transform', 'translate(0 ' + f(26 * (1 - a)) + ')');
        });
      });
    };
  }

  /* --- rakel-overgang: een mint baan veegt het volgende shot erin --- */
  function Rakel(parent) {
    var band = Li(parent, 0, 0, 0, 0, K.mint, 120), edge = Li(parent, 0, 0, 0, 0, '#FFFFFF', 10, { opacity: 0.55 });
    show(band, false); show(edge, false);
    // p = 0..1; geeft de x van de schuine rand op y = 0
    this.x = function (p) { return lerp(-1080 * COT - 200, 1920 + 200, p); };
    this.draw = function (p) {
      var on = p > 0 && p < 1;
      show(band, on); show(edge, on);
      if (!on) return;
      var xe = this.x(p), ya = -160, yb = 1240;
      sa(band, 'x1', f(xe + ya * COT + 62)); sa(band, 'y1', ya); sa(band, 'x2', f(xe + yb * COT + 62)); sa(band, 'y2', yb);
      sa(edge, 'x1', f(xe + ya * COT - 4)); sa(edge, 'y1', ya); sa(edge, 'x2', f(xe + yb * COT - 4)); sa(edge, 'y2', yb);
    };
  }

  /* --- vloeiende lijn door punten (Catmull-Rom), als reeks monsters met lengte --- */
  function Route(pts, n) {
    var out = [], i, j, len = 0;
    for (i = 0; i < pts.length - 1; i++) {
      var p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (j = 0; j < n; j++) {
        var u = j / n, u2 = u * u, u3 = u2 * u;
        out.push([0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * u + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * u2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * u3),
          0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * u + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * u3)]);
      }
    }
    out.push(pts[pts.length - 1]);
    var L = [0];
    for (i = 1; i < out.length; i++) { len += Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]); L.push(len); }
    this.pts = out; this.len = len;
    this.at = function (q) {
      var d = clamp(q, 0, 1) * len, lo = 0, hi = L.length - 1;
      while (hi - lo > 1) { var m = (lo + hi) >> 1; if (L[m] <= d) lo = m; else hi = m; }
      var k = (d - L[lo]) / ((L[hi] - L[lo]) || 1);
      return [lerp(out[lo][0], out[hi][0], k), lerp(out[lo][1], out[hi][1], k), lo];
    };
    this.d = function (q) {
      var a = this.at(q), s = 'M' + f(out[0][0]) + ' ' + f(out[0][1]);
      for (var k2 = 1; k2 <= a[2]; k2++) s += 'L' + f(out[k2][0]) + ' ' + f(out[k2][1]);
      return s + 'L' + f(a[0]) + ' ' + f(a[1]);
    };
  }

  /* --- het busje (zijaanzicht, rijdt naar rechts). Oorsprong: grond onder de achterkant. --- */
  function Van(parent) {
    var g = G(parent), body = G(g), self = this;
    this.g = g;
    Rc(g, 30, -8, 480, 16, 8, '#22262A', { opacity: 0.12 });
    // dakdrager met steigerbuizen
    Li(body, 70, -278, 320, -278, K.alu, 9); Li(body, 96, -290, 300, -290, K.aluDark, 7);
    Li(body, 84, -272, 84, -262, K.aluDark, 6); Li(body, 300, -272, 300, -262, K.aluDark, 6);
    Pa(body, 'M16 -52L16 -236Q16 -262 42 -262L318 -262Q348 -262 366 -246L432 -176Q440 -168 452 -166L506 -156Q530 -152 532 -128L532 -74Q532 -52 510 -52Z', K.mint);
    Pa(body, 'M330 -242L356 -242Q364 -242 370 -236L418 -186Q424 -178 414 -178L330 -178Z', '#2C3A40');
    Pa(body, 'M346 -242L360 -242L392 -208L378 -208Z', '#FFFFFF', { opacity: 0.16 });
    Li(body, 322, -246, 322, -72, K.mintDeep, 2.2, { opacity: 0.28 });
    Rc(body, 292, -166, 20, 7, 3.5, K.inkSoft);
    Rc(body, 518, -140, 12, 24, 6, '#FFF1C9');
    Rc(body, 14, -176, 8, 36, 4, K.rust);
    Rc(body, 10, -72, 528, 24, 10, K.inkSoft);
    // wit logo op de zijkant, net als op de echte bus
    var lg = G(body, { transform: 'translate(38 -230) scale(0.285)' });
    new Mark(lg, '#FFFFFF');
    new Word(lg, '#FFFFFF');
    var tg = G(body, { transform: 'translate(38 -162) scale(0.2967)' }), tag = new Tagline(G(tg, { transform: 'translate(0 -418.5)' }), '#FFFFFF');
    tag.set(9);
    Ci(g, 118, -46, 56, K.inkSoft); Ci(g, 420, -46, 56, K.inkSoft);
    this.wheels = [118, 420].map(function (cx) {
      var w = G(g);
      Ci(w, cx, -46, 46, '#22262A'); Ci(w, cx, -46, 22, '#DDE3E2');
      for (var i = 0; i < 5; i++) Ci(w, cx + 13 * Math.cos(i * 1.2566), -46 + 13 * Math.sin(i * 1.2566), 3.4, '#8B979B');
      return { g: w, cx: cx };
    });
    // x = positie achterkant, dist = afgelegde weg (voor de wielen), pitch = duik bij remmen (graden)
    this.set = function (x, y, s, dist, pitch) {
      sa(g, 'transform', 'translate(' + f(x) + ' ' + f(y) + ') scale(' + f(s) + ')');
      var a = (dist || 0) / 46 * 180 / Math.PI;
      self.wheels.forEach(function (w) { sa(w.g, 'transform', 'rotate(' + f(a % 360) + ' ' + w.cx + ' -46)'); });
      sa(body, 'transform', pitch ? 'rotate(' + f(pitch) + ' 270 -52)' : null);
    };
  }

  /* --- KAART: aanvraag, route, inzoomen -------------------------------------------- */
  function ringD(r) { var s = 'M'; for (var i = 0; i < r.length; i++) s += (i ? 'L' : '') + r[i][0] + ' ' + r[i][1]; return s + 'Z'; }
  function MapShot(st, parent, o) {
    var g = G(parent);
    Rc(g, -400, -400, 2720, 1880, 0, K.paper);
    var world = G(g), self = this;
    var landD = NL.land.map(ringD).join(''), HOME = NL.cities.Hilversum, DEST = NL.cities[o.dest || 'Groningen'];
    var landG = G(world);
    Pa(landG, landD, '#E2E9E5', { transform: 'translate(0 7)' });
    Pa(landG, landD, K.mint, { stroke: K.mint, 'stroke-width': 2.4, 'stroke-linejoin': 'round' });
    Pa(landG, ringD(NL.lake), K.paper);
    Pa(landG, ringD(NL.flevo), '#E2E9E5', { transform: 'translate(0 5)' });
    Pa(landG, ringD(NL.flevo), K.mint, { stroke: K.mint, 'stroke-width': 1.6, 'stroke-linejoin': 'round' });
    var clip = new SlantClip(st, landG);
    // route + busje
    var route = new Route(NL.route, 14);
    var routeBg = Pa(world, route.d(1), 'none', { stroke: '#FFFFFF', 'stroke-width': 5.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.55 });
    var routeLn = Pa(world, 'M0 0', 'none', { stroke: K.mintDeep, 'stroke-width': 3.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    // plaatsen
    var pins = [], name;
    for (name in NL.cities) {
      if (name === 'Hilversum') continue;
      var c = NL.cities[name], d = Math.hypot(c[0] - HOME[0], c[1] - HOME[1]);
      pins.push({ name: name, x: c[0], y: c[1], d: d, ring: Ci(world, c[0], c[1], 0, 'none', { stroke: K.mintDeep, 'stroke-width': 1.4, opacity: 0 }), n: Ci(world, c[0], c[1], 0, '#FFFFFF', { stroke: K.mintDeep, 'stroke-width': 1.5 }) });
    }
    var dest = pins.filter(function (p) { return p.name === (o.dest || 'Groningen'); })[0];
    var pulse = [0, 1, 2].map(function () { return Ci(world, DEST[0], DEST[1], 0, 'none', { stroke: K.ink, 'stroke-width': 1.6 }); });
    var destDot = Ci(world, DEST[0], DEST[1], 0, K.ink);
    var check = Pa(world, 'M' + (DEST[0] - 5) + ' ' + DEST[1] + 'l3.6 3.8l6.4 -7.6', 'none', { stroke: '#FFFFFF', 'stroke-width': 2.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    var homeG = G(world), homeDisc = Ci(homeG, HOME[0], HOME[1], 21, '#FFFFFF', { stroke: K.mintDeep, 'stroke-width': 1.6 });
    new Mark(G(homeG, { transform: 'translate(' + (HOME[0] - 13.4) + ' ' + (HOME[1] - 7.2) + ') scale(0.09)' }), K.mint);
    var vanG = G(world);
    Ci(vanG, 0, 1.5, 21, '#22262A', { opacity: 0.12 }); Ci(vanG, 0, 0, 21, '#FFFFFF', { stroke: K.mintDeep, 'stroke-width': 1.5 });
    var van = new Van(vanG);
    // labels en kaartje in schermruimte (blijven even groot bij het inzoomen)
    var ui = G(g);
    var lblHome = Tx(ui, 'Hilversum', 0, 0, 24, 600, K.ink, 'end');
    var lblDest = Tx(ui, o.dest || 'Groningen', 0, 0, 24, 600, K.ink, 'start');
    var card = G(ui);
    Rc(card, 0, 10, 372, 118, 26, '#22262A', { opacity: 0.1 });
    Rc(card, 0, 0, 372, 118, 26, '#FFFFFF');
    Rc(card, 18, 18, 82, 82, 16, K.mintSoft);
    Rc(card, 36, 34, 46, 50, 5, K.creamOld); Rc(card, 43, 41, 32, 36, 2, K.glass1);
    Li(card, 34, 88, 84, 78, K.rust, 5);
    Tx(card, 'Nieuwe aanvraag', 118, 52, 27, 700, K.ink);
    Tx(card, 'foto + maten', 118, 86, 21, 500, K.sub);
    var chips = ['Vaste prijs', 'Afspraak gepland'].map(function (s, i) {
      var cg = G(ui), w = i ? 292 : 220;
      Rc(cg, 0, 0, w, 58, 29, K.mintDeep);
      Ci(cg, 29, 29, 15, '#FFFFFF');
      Pa(cg, 'M22 29l5 5.4l9 -10.6', 'none', { stroke: K.mintDeep, 'stroke-width': 3.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
      Tx(cg, s, 56, 38, 23, 600, '#FFFFFF');
      return { g: cg, w: w };
    });
    // titelblok links
    var title = G(g);
    var tl = [Tx(title, 'IWRAP  ·  SPECIALIST IN KOZIJNFOLIE', 150, 372, 21, 600, K.mintInk, 'start', '0.24em'),
      Tx(title, 'Waar je ook', 146, 476, 88, 700, K.ink), Tx(title, 'woont in', 146, 576, 88, 700, K.ink), Tx(title, 'Nederland', 146, 676, 88, 700, K.ink),
      Tx(title, 'Wij komen naar je toe.', 150, 752, 34, 500, K.sub)];
    var maxD = 0; pins.forEach(function (p) { maxD = Math.max(maxD, p.d); });

    // camera: [cx, cy, zoom] in kaart-eenheden
    function cam(t) {
      var T = o.T, vp = route.at(seg(t, T.route, T.routeD, E.glide)), k, z, cx, cy;
      var c0 = [-287, -5, 1.08], c1 = [40, -176, 1.45];
      if (t < T.book) return c0;
      if (t < T.route) { k = E.inOut(seg(t, T.book, 1.5)); return [lerp(c0[0], c1[0], k), lerp(c0[1], c1[1], k), lerp(c0[2], c1[2], k)]; }
      k = E.inOut(seg(t, T.route + 0.2, 2.2));
      z = lerp(c1[2], 2.7, E.inOut(seg(t, T.route + 0.2, T.routeD - 0.6))) * lerp(1, 2.4, E.in(seg(t, T.iris - 0.5, 1.4)));
      cx = lerp(c1[0], vp[0], k); cy = lerp(c1[1], vp[1] - 12, k);
      return [cx, cy, z];
    }
    this.cam = cam;
    this.screen = function (p, c) { return [960 + c[2] * (p[0] - c[0]), 540 + c[2] * (p[1] - c[1])]; };
    // mode 'in' = openingsdeel; mode 'out' = terug uitgezoomd aan het eind (to = tijd binnen dat deel)
    this.render = function (t, mode, to) {
      var T = o.T, c, i, p, a;
      if (mode === 'out') {
        var k2 = E.inOut(seg(to, 0, 1.6));
        c = [lerp(DEST[0], -150, k2), lerp(DEST[1] - 10, -5, k2), lerp(3.2, 1.08, k2)];
      } else c = cam(t);
      sa(world, 'transform', 'translate(960 540) scale(' + f(c[2]) + ') translate(' + f(-c[0]) + ' ' + f(-c[1]) + ')');
      if (mode === 'out') {
        clip.off();
        for (i = 0; i < pins.length; i++) {
          p = pins[i];
          sa(p.n, 'r', p === dest ? 0 : 6.2);
          a = ((to * 0.55 + p.d * 0.0031) % 1);
          sa(p.ring, 'r', f(6 + a * 16)); sa(p.ring, 'opacity', f((1 - a) * 0.55 * seg(to, 0.8, 0.6)));
        }
        pulse.forEach(function (n) { sa(n, 'r', 0); });
        sa(destDot, 'r', f(10 * pop(to, 0.2, 0.5))); op(check, seg(to, 0.5, 0.3));
        sa(routeLn, 'd', route.d(1)); op(routeLn, 1 - seg(to, 0.4, 0.8)); op(routeBg, 0);
        show(vanG, false); show(card, false); chips.forEach(function (ch) { show(ch.g, false); });
        show(title, false); show(lblDest, false);
        var hs = this.screen(HOME, c);
        sa(lblHome, 'x', f(hs[0] - 34)); sa(lblHome, 'y', f(hs[1] + 8)); op(lblHome, seg(to, 1.0, 0.4));
        sa(homeG, 'transform', null);
        return;
      }
      // land veegt erin
      var lp = seg(t, 0.15, 1.1, E.inOut);
      if (lp >= 1) clip.off(); else clip.set(lerp(-560, 620, lp), -1);
      // titel
      for (i = 0; i < tl.length; i++) {
        a = seg(t, 0.25 + i * 0.11, 0.7, E.out);
        var out = seg(t, T.book - 0.1 + i * 0.04, 0.45, E.in);
        op(tl[i], Math.min(seg(t, 0.25 + i * 0.11, 0.35), 1 - out));
        sa(tl[i], 'transform', 'translate(' + f(-70 * out) + ' ' + f(26 * (1 - a)) + ')');
      }
      // thuisbasis en plaatsen
      var hsS = pop(t, 1.0, 0.5);
      sa(homeG, 'transform', 'translate(' + HOME[0] + ' ' + HOME[1] + ') scale(' + f(hsS) + ') translate(' + (-HOME[0]) + ' ' + (-HOME[1]) + ')');
      for (i = 0; i < pins.length; i++) {
        p = pins[i];
        var t0 = 1.35 + (p.d / maxD) * 1.5;
        sa(p.n, 'r', f(6.2 * pop(t, t0, 0.4) * (p === dest ? 1 - seg(t, T.book + 0.2, 0.3) : 1)));
        a = seg(t, t0, 0.7);
        sa(p.ring, 'r', f(6 + a * 15)); sa(p.ring, 'opacity', f(a > 0 && a < 1 ? (1 - a) * 0.6 : 0));
      }
      // bestemming: pulserende ringen
      sa(destDot, 'r', f(9 * pop(t, T.book + 0.25, 0.45)));
      op(check, 0);
      pulse.forEach(function (n, j) {
        var q = ((t - T.book - 0.3) / 1.5 + j / 3) % 1, on = t > T.book + 0.3 && t < T.iris;
        sa(n, 'r', f(on ? 9 + q * 34 : 0)); sa(n, 'opacity', f(on ? (1 - q) * 0.5 : 0));
      });
      // labels
      var hs2 = this.screen(HOME, c), ds = this.screen(DEST, c);
      sa(lblHome, 'x', f(hs2[0] - 26 * c[2] / 1.08 - 8)); sa(lblHome, 'y', f(hs2[1] + 8));
      op(lblHome, Math.min(seg(t, 1.3, 0.4), 1 - seg(t, T.route + 1.4, 0.5)));
      sa(lblDest, 'x', f(ds[0] + 22)); sa(lblDest, 'y', f(ds[1] - 16));
      op(lblDest, Math.min(seg(t, T.book + 0.5, 0.4), 1 - seg(t, T.iris - 0.3, 0.3)));
      // kaartje met de aanvraag
      var cs = pop(t, T.book + 0.55, 0.5) * (1 - seg(t, T.route - 0.05, 0.3, E.in)), cxp = ds[0] - 420, cyp = ds[1] + 34;
      show(card, cs > 0.001);
      sa(card, 'transform', 'translate(' + f(cxp + 372) + ' ' + f(cyp) + ') scale(' + f(cs) + ') translate(-372 0)');
      chips.forEach(function (ch, j) {
        var s2 = pop(t, T.book + 1.55 + j * 0.75, 0.45) * (1 - seg(t, T.route - 0.05 + j * 0.05, 0.3, E.in));
        show(ch.g, s2 > 0.001);
        sa(ch.g, 'transform', 'translate(' + f(cxp + 372) + ' ' + f(cyp + 136 + j * 70) + ') scale(' + f(s2) + ') translate(' + (-ch.w) + ' 0)');
      });
      // route en busje
      var rq = seg(t, T.route, T.routeD, E.glide), vp = route.at(rq), vs = pop(t, T.route - 0.35, 0.4), VS = 0.056;
      sa(routeLn, 'd', route.d(rq)); op(routeLn, t >= T.route ? 1 : 0);
      op(routeBg, seg(t, T.route - 0.3, 0.5) * 0.55);
      show(vanG, vs > 0.0005);
      sa(vanG, 'transform', 'translate(' + f(vp[0]) + ' ' + f(vp[1]) + ') scale(' + f(vs) + ')');
      van.set(-270 * VS, 150 * VS, VS, rq * route.len / VS, 0);
    };
    this.g = g; this.dest = DEST;
  }

  /* ================================================================ de film */
  SC.klus = function (o) {
    var W = o.frame ? o.frame[0] : 1920, H = o.frame ? o.frame[1] : 1080, th = theme({ theme: 'light' });
    var st = Stage({ frame: [W, H], label: 'iWrap: van aanvraag tot afgeleverd kozijn' }, W, H, th);
    var vert = H > W * 1.2, sc = Math.min(W / 1920, H / 1080), root, vui = null;
    if (vert) {
      // staand: het filmbeeld als kaart in het midden, logo erboven, ondertitels groot eronder (ontwerpruimte 1080 breed)
      var fsc = W / 1080, fg = G(st.svg, { transform: 'scale(' + f(fsc) + ')' }), VH = H / fsc;
      Rc(fg, 0, 0, 1080, VH, 0, '#FFFFFF');
      var bx = 36, bw = 1008, bh = 567, by = Math.round(VH * 0.5 - 400);
      Rc(fg, bx, by + 16, bw, bh, 32, '#22262A', { opacity: 0.1 });
      var cpv = el('clipPath', { id: st.id + 'vb' }, st.defs);
      Rc(cpv, bx, by, bw, bh, 32);
      root = G(G(fg, { 'clip-path': 'url(#' + st.id + 'vb)' }), { transform: 'translate(' + bx + ' ' + by + ') scale(' + f(bw / 1920) + ')' });
      vui = { g: fg, by: by, bh: bh, VH: VH };
    } else root = G(st.svg, { transform: 'translate(' + f((W - 1920 * sc) / 2) + ' ' + f((H - 1080 * sc) / 2) + ') scale(' + f(sc) + ')' });
    Rc(root, -400, -400, 2720, 1880, 0, K.paper);
    var T = { book: 3.8, route: 7.7, routeD: 4.3 };
    T.iris = T.route + T.routeD + 0.35;            // de stip groeit tot het hele beeld mint is
    T.street = T.iris + 0.75;                      // straat veegt erin
    var mapIn = new MapShot(st, root, { T: T, dest: o.dest });
    var iris = Ci(root, 0, 0, 0, K.mint);
    var extra = SC.klus.build ? SC.klus.build(st, root, T, o) : null;
    var rakel = new Rakel(root);
    var capList = [
      { t0: T.book + 0.9, t1: T.route - 0.25, text: 'Stuur een foto. Je krijgt een vaste prijs.' },
      { t0: T.route + 0.5, t1: T.iris - 0.35, text: 'Wij komen naar je toe.' }
    ];
    if (extra) capList = capList.concat(extra.captions);
    var caps = vert ? new CaptionsV(vui.g, capList, vui.by + vui.bh + 170) : new Captions(root, capList);
    if (vert) {
      var L0 = GEO.lockups.horizontal, ls0 = 500 / L0.w, thL = theme({ theme: 'light' }), thM = theme({ theme: 'mint' });
      vui.logo = uitrolInto(st, G(vui.g, { transform: 'translate(' + f(540 - L0.w * ls0 / 2) + ' ' + f(vui.by - 250) + ') scale(' + f(ls0) + ')' }), L0, 'horizontal', thL, { outro: false, hold: 0, shift: false, sheen: false });
      vui.url = Tx(vui.g, 'iwrap.nl', 540, vui.VH - 150, 40, 600, K.mintInk, 'middle', '0.06em');
      // eindkaart over het hele beeld
      var eg = G(vui.g), L1 = GEO.lockups.tagline, ls1 = 760 / L1.w;
      Rc(eg, 0, 0, 1080, vui.VH, 0, K.mint);
      var rgv = el('radialGradient', { id: st.id + 'vg', gradientUnits: 'userSpaceOnUse', cx: 540, cy: f(vui.VH / 2), r: f(vui.VH * 0.62) }, st.defs);
      el('stop', { offset: 0, 'stop-color': '#000' }, rgv); el('stop', { offset: 0.42, 'stop-color': '#000' }, rgv); el('stop', { offset: 1, 'stop-color': '#fff' }, rgv);
      var mkv = el('mask', { id: st.id + 'vm', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: 1080, height: f(vui.VH) }, st.defs);
      Rc(mkv, 0, 0, 1080, vui.VH, 0, 'url(#' + st.id + 'vg)');
      vui.pat = new Pattern(G(eg, { mask: 'url(#' + st.id + 'vm)' }), 1080, vui.VH, thM.pat, { patScale: 1.25, patLoop: 16, seed: 11 });
      vui.endLogo = uitrolInto(st, G(eg, { transform: 'translate(' + f(540 - L1.w * ls1 / 2) + ' ' + f(vui.VH / 2 - L1.h * ls1 / 2 - 60) + ') scale(' + f(ls1) + ')' }), L1, 'tagline', thM, { outro: false, hold: 0, shift: true });
      vui.endUrl = Tx(eg, 'iwrap.nl', 540, vui.VH / 2 + 300, 50, 600, '#FFFFFF', 'middle', '0.06em');
      vui.endG = eg;
    }
    var duration = extra ? extra.duration : T.street + 0.5;
    function render(t) {
      var mapOn = t < T.street + 0.05;
      show(mapIn.g, mapOn);
      if (mapOn) mapIn.render(t, 'in');
      // iris vanuit de bestemming
      var ip = seg(t, T.iris, 0.7, E.in), c = mapIn.cam(t), ds = mapIn.screen(mapIn.dest, c);
      var irisOn = ip > 0 && (!extra || t < extra.irisOff);
      show(iris, irisOn);
      if (irisOn) { sa(iris, 'cx', f(ds[0])); sa(iris, 'cy', f(ds[1])); sa(iris, 'r', f(ip * 2300)); }
      if (extra) extra.render(t, rakel);
      caps.render(t);
      if (vert) {
        vui.logo.render(t - 0.2);
        op(vui.url, seg(t, 1.2, 0.5));
        var te = extra ? t - T.end - 0.45 : -1, eo = seg(te, 0, 0.55, E.inOut);
        op(vui.endG, eo);
        if (eo > 0) { vui.pat.render(te); vui.endLogo.render(te - 0.35); op(vui.endUrl, seg(te, 0.35 + vui.endLogo.rest - 0.9, 0.5)); }
      }
    }
    return { svg: st.svg, duration: duration, rest: duration, render: render, T: T };
  };


  /* --- poppetje: een stip en een paar banen, net als de "i" uit het logo ------------- */
  function Person(parent, o) {
    var g = G(parent), far = mix(o.shirt, '#000000', 0.22), L = Li;
    this.g = g; this.o = o;
    el('ellipse', { cx: 0, cy: 3, rx: 36, ry: 7, fill: '#22262A', opacity: 0.13 }, g);
    this.fu = L(g, 0, 0, 0, 0, far, 17); this.fl = L(g, 0, 0, 0, 0, mix(o.skin, '#000000', 0.12), 14);
    this.lf = L(g, 0, 0, 0, 0, mix(o.pants, '#000000', 0.2), 22); this.sf = L(g, 0, 0, 0, 0, '#17191B', 15);
    this.ln = L(g, 0, 0, 0, 0, o.pants, 22); this.sn = L(g, 0, 0, 0, 0, '#22262A', 15);
    var b = G(g);
    this.body = b;
    Rc(b, -24, -192, 48, 104, 22, o.shirt);
    Rc(b, -7, -203, 14, 18, 6, mix(o.skin, '#000000', 0.08));
    Ci(b, 0, -220, 24, o.skin);
    if (o.hair === 'cap') { Pa(b, 'M-25 -222A25 25 0 0 1 25 -222Z', o.hairColor); Rc(b, 6, -229, 36, 9, 4.5, o.hairColor); }
    else if (o.hair === 'bun') { Ci(b, -27, -238, 11, o.hairColor); Pa(b, 'M24 -226A25 25 0 0 0 -25.5 -214L-23 -199Q-12 -216 6 -224Q16 -228 24 -226Z', o.hairColor); }
    else Pa(b, 'M24 -224A25 25 0 0 0 -25.5 -216L-24 -207Q-10 -228 24 -224Z', o.hairColor);
    if (o.logo) new Mark(G(b, { transform: 'translate(-3 -176) scale(0.075)' }), '#FFFFFF');
    this.nu = L(g, 0, 0, 0, 0, o.shirt, 18); this.nl = L(g, 0, 0, 0, 0, o.skin, 15);
  }
  // p: x, y, face (1 of -1), walk (fase), a/b = [schouder, elleboog] in graden (0 = omlaag, + = naar voren),
  //    lean (graden), s (schaal), o (dekking)
  Person.prototype.set = function (p) {
    var s = (p.s == null ? 1 : p.s) * 0.93, wt = p.wt == null ? (p.walking ? 1 : 0) : p.wt, amp = (p.amp == null ? 25 : p.amp) * wt;
    var w = p.x / (p.stride || 168), sw = Math.sin(2 * Math.PI * w);
    var bob = -3.5 * Math.abs(Math.cos(2 * Math.PI * w)) * (amp / 25);
    if (p.o != null) op(this.g, p.o); else op(this.g, 1);
    sa(this.g, 'transform', 'translate(' + f(p.x) + ' ' + f(p.y + bob) + ') scale(' + f(s * (p.face || 1)) + ' ' + f(s) + ')');
    function leg(ln, sh, a, hx) {
      var r = rad(a), fx = hx + 106 * Math.sin(r), fy = -106 + 106 * Math.cos(r);
      sa(ln, 'x1', hx); sa(ln, 'y1', -106); sa(ln, 'x2', f(fx)); sa(ln, 'y2', f(fy));
      sa(sh, 'x1', f(fx)); sa(sh, 'y1', f(fy + 2)); sa(sh, 'x2', f(fx + 15 * Math.cos(r))); sa(sh, 'y2', f(fy + 2 - 15 * Math.sin(r)));
    }
    var la = sw * amp;
    leg(this.ln, this.sn, la, 4); leg(this.lf, this.sf, -la, -4);
    function arm(u, l, sx, a) {
      var r1 = rad(a[0]), r2 = rad(a[0] + a[1]), ex = sx + 46 * Math.sin(r1), ey = -178 + 46 * Math.cos(r1);
      var hx = ex + 44 * Math.sin(r2), hy = ey + 44 * Math.cos(r2);
      sa(u, 'x1', sx); sa(u, 'y1', -178); sa(u, 'x2', f(ex)); sa(u, 'y2', f(ey));
      sa(l, 'x1', f(ex)); sa(l, 'y1', f(ey)); sa(l, 'x2', f(hx)); sa(l, 'y2', f(hy));
    }
    var an = p.a || [-sw * 22 * wt + 4, 12], af = p.b || [sw * 22 * wt - 2, 10];
    arm(this.nu, this.nl, 3, an); arm(this.fu, this.fl, -3, af);
    sa(this.body, 'transform', p.lean ? 'rotate(' + f(p.lean) + ' 0 -106)' : null);
  };

  // loopgewicht: 0 bij stilstand, 1 onderweg (zachte overgang aan begin en eind)
  function ww(k) { return clamp(Math.min(k, 1 - k) * 7, 0, 1); }

  /* --- het huis: bakstenen gevel met kunststof kozijnen ------------------------------ */
  function House(st, parent) {
    var g = G(parent), self = this, i;
    this.g = g;
    var bid = st.id + 'br', bp = el('pattern', { id: bid, patternUnits: 'userSpaceOnUse', width: 64, height: 32 }, st.defs);
    Rc(bp, 0, 0, 64, 32, 0, K.brick);
    Rc(bp, 0, 0, 64, 1.6, 0, '#FFFFFF', { opacity: 0.2 }); Rc(bp, 0, 16, 64, 1.6, 0, '#FFFFFF', { opacity: 0.2 });
    Rc(bp, 0, 0, 1.6, 16, 0, '#FFFFFF', { opacity: 0.2 }); Rc(bp, 32, 16, 1.6, 16, 0, '#FFFFFF', { opacity: 0.2 });
    Rc(bp, 6, 4, 22, 9, 1, '#000000', { opacity: 0.05 }); Rc(bp, 38, 20, 20, 9, 1, '#FFFFFF', { opacity: 0.06 });
    this.brick = 'url(#' + bid + ')';
    // buren, vager, zodat het een straat wordt
    var pale = function (c) { return mix(c, K.paper, 0.58); };
    [[70, 760], [1570, 760]].forEach(function (n) {
      var x = n[0];
      Rc(g, x - 18, 204, n[1] + 36, 150, 4, pale(K.roof));
      Rc(g, x, 354, n[1], 506, 0, pale(K.brick));
      [[70, 404, 220, 168], [430, 404, 220, 168], [400, 626, 290, 190]].forEach(function (w) {
        Rc(g, x + w[0], w[1], w[2], w[3], 5, pale('#FFFFFF')); Rc(g, x + w[0] + 12, w[1] + 12, w[2] - 24, w[3] - 24, 2, pale(K.glass2));
      });
      Rc(g, x + 110, 612, 108, 248, 4, pale(K.inkSoft));
    });
    // dak, schoorsteen, goot
    Rc(g, 1368, 150, 64, 80, 3, K.brickDark); Rc(g, 1360, 142, 80, 14, 4, K.roof);
    Rc(g, 812, 196, 776, 162, 5, K.roof);
    for (i = 0; i < 6; i++) Rc(g, 812, 220 + i * 24, 776, 2, 0, '#FFFFFF', { opacity: 0.06 });
    Rc(g, 804, 350, 792, 15, 6, '#E3E7E6');
    Rc(g, 830, 364, 740, 496, 0, this.brick);
    Rc(g, 830, 838, 740, 22, 0, K.brickDark, { opacity: 0.55 });
    Rc(g, 830, 364, 740, 10, 0, '#000000', { opacity: 0.1 });
    // kozijnen: oud (verweerd) en nieuw, glas eroverheen
    var wins = [{ x: 896, y: 404, w: 232, h: 170, cols: [0.5, 0.5] }, { x: 1272, y: 404, w: 232, h: 170, cols: [0.5, 0.5] }, { x: 1180, y: 626, w: 324, h: 196, cols: [0.62, 0.38] }];
    var door = { x: 902, y: 612, w: 112, h: 248 };
    this.wins = wins; this.door = door;
    Rc(g, door.x, door.y, door.w, door.h, 3, '#2A2E32');                 // gang achter de deur
    var oldG = G(g), newG = G(g);
    function frames(p, col, old) {
      wins.forEach(function (w, wi) {
        Rc(p, w.x, w.y, w.w, w.h, 5, col);
        if (old) {
          Rc(p, w.x + 4, w.y + w.h - 15, w.w - 8, 11, 3, K.creamOldDark, { opacity: 0.7 });
          Rc(p, w.x + 2, w.y + 30 + wi * 14, 9, 46, 3, K.creamOldDark, { opacity: 0.6 });
          Rc(p, w.x + 26 + wi * 30, w.y + w.h - 12, 34, 7, 2, K.glue);
          Rc(p, w.x + w.w - 60 - wi * 22, w.y + w.h - 11, 22, 6, 2, K.glue);
          Pa(p, 'M' + (w.x + 70) + ' ' + (w.y + 4) + 'l14 5l10 -4l16 6', 'none', { stroke: '#9C8A62', 'stroke-width': 1.4 });
          Pa(p, 'M' + (w.x + w.w - 8) + ' ' + (w.y + 70) + 'l-5 12l4 9l-5 14', 'none', { stroke: '#9C8A62', 'stroke-width': 1.4 });
        }
      });
      Pa(p, 'M' + (door.x - 13) + ' ' + (door.y + door.h) + 'L' + (door.x - 13) + ' ' + (door.y - 8) + 'Q' + (door.x - 13) + ' ' + (door.y - 13) + ' ' + (door.x - 8) + ' ' + (door.y - 13) +
        'L' + (door.x + door.w + 8) + ' ' + (door.y - 13) + 'Q' + (door.x + door.w + 13) + ' ' + (door.y - 13) + ' ' + (door.x + door.w + 13) + ' ' + (door.y - 8) + 'L' + (door.x + door.w + 13) + ' ' + (door.y + door.h) +
        'L' + (door.x + door.w) + ' ' + (door.y + door.h) + 'L' + (door.x + door.w) + ' ' + door.y + 'L' + door.x + ' ' + door.y + 'L' + door.x + ' ' + (door.y + door.h) + 'Z', col);
      if (old) { Rc(p, door.x - 11, door.y + 150, 8, 60, 3, K.creamOldDark, { opacity: 0.6 }); Rc(p, door.x + door.w + 4, door.y + 40, 6, 20, 2, K.glue); }
    }
    frames(oldG, K.creamOld, true); frames(newG, K.creamNew, false);
    this.newClip = new SlantClip(st, newG); this.newG = newG;
    // glas + spiegeling onder de logo-hoek
    var gid = st.id + 'hg', gg = el('linearGradient', { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 }, st.defs);
    el('stop', { offset: 0, 'stop-color': K.glass1 }, gg); el('stop', { offset: 1, 'stop-color': K.glass2 }, gg);
    var cid = st.id + 'hc', cp = el('clipPath', { id: cid }, st.defs), glassG = G(g), det = G(g, { fill: 'none' });
    wins.forEach(function (w) {
      var t = 13, m = 10, x = w.x + t, inner = w.w - 2 * t - m * (w.cols.length - 1);
      w.cols.forEach(function (c, ci) {
        var pw = inner * c;
        Rc(glassG, x, w.y + t, pw, w.h - 2 * t, 2, 'url(#' + gid + ')');
        Rc(cp, x, w.y + t, pw, w.h - 2 * t, 2);
        Rc(det, x, w.y + t, pw, w.h - 2 * t, 2, 'none', { stroke: '#000000', 'stroke-opacity': 0.18, 'stroke-width': 1.6 });
        if (ci > 0) Rc(det, x + 5, w.y + t + 5, pw - 10, w.h - 2 * t - 10, 1, 'none', { stroke: '#000000', 'stroke-opacity': 0.12, 'stroke-width': 1.4 });
        x += pw + m;
      });
      Rc(det, w.x, w.y, w.w, w.h, 5, 'none', { stroke: '#000000', 'stroke-opacity': 0.12, 'stroke-width': 1.4 });
      Rc(g, w.x - 9, w.y + w.h, w.w + 18, 12, 2, K.tile); Rc(g, w.x - 9, w.y + w.h, w.w + 18, 3, 1, '#FFFFFF', { opacity: 0.18 });
    });
    var refl = G(g, { 'clip-path': 'url(#' + cid + ')', fill: '#FFFFFF' });
    [[900, 46, 0.4], [990, 14, 0.28], [1250, 40, 0.36], [1330, 12, 0.26], [1120, 54, 0.3]].forEach(function (r) {
      Pa(refl, 'M' + f(r[0] + 390 * COT) + ' 390L' + f(r[0] + r[1] + 390 * COT) + ' 390L' + f(r[0] + r[1] + 840 * COT) + ' 840L' + f(r[0] + 840 * COT) + ' 840Z', '#FFFFFF', { opacity: r[2] });
    });
    // voordeur (scharniert links)
    var leaf = G(g);
    this.leaf = leaf;
    Rc(leaf, door.x, door.y, door.w, door.h, 3, '#2F4A3D');
    Rc(leaf, door.x + 24, door.y + 28, door.w - 48, 86, 4, K.glass2);
    Rc(leaf, door.x + 14, door.y + 140, door.w - 28, 90, 4, '#000000', { opacity: 0.12 });
    Rc(leaf, door.x + door.w - 22, door.y + 124, 8, 30, 4, '#C9CED0');
    this.setDoor = function (k) {   // 0 = dicht, 1 = open
      sa(leaf, 'transform', k <= 0 ? null : 'translate(' + door.x + ' 0) scale(' + f(1 - 0.8 * k) + ' 1) translate(' + (-door.x) + ' 0)');
    };
    // glinsteringen na oplevering
    this.sparks = [[940, 430], [1100, 548], [1320, 424], [1480, 560], [1240, 650], [1470, 800], [1000, 640]].map(function (p) {
      return { x: p[0], y: p[1], n: Pa(g, 'M0 -16Q2 -2 16 0Q2 2 0 16Q-2 2 -16 0Q-2 -2 0 -16Z', '#FFFFFF') };
    });
  }

  /* --- rolsteiger -------------------------------------------------------------------- */
  function Scaffold(parent) {
    var g = G(parent), parts = [];
    this.g = g;
    function tube(x1, y1, x2, y2, col, sw, a0) { parts.push({ n: Li(g, x1, y1, x1, y1, col, sw), a: [x1, y1, x2, y2], t: a0 }); }
    tube(1262, 852, 1262, 470, K.alu, 10, 0.0); tube(1522, 852, 1522, 470, K.alu, 10, 0.08);
    tube(1262, 800, 1522, 800, K.alu, 8, 0.28);
    tube(1262, 800, 1522, 620, K.aluDark, 6, 0.38); tube(1522, 800, 1262, 620, K.aluDark, 6, 0.46);
    tube(1246, 606, 1538, 606, K.inkSoft, 15, 0.56);
    tube(1262, 538, 1522, 538, K.alu, 8, 0.7); tube(1262, 474, 1522, 474, K.alu, 8, 0.78);
    var wheels = [Ci(g, 1262, 858, 0, K.inkSoft), Ci(g, 1522, 858, 0, K.inkSoft)];
    this.platformY = 598;
    this.set = function (b) {     // b = 0..1 opbouw
      show(g, b > 0.001);
      parts.forEach(function (p) {
        var k = E.out(clamp((b - p.t) / 0.22, 0, 1));
        show(p.n, k > 0.001);
        sa(p.n, 'x2', f(lerp(p.a[0], p.a[2], k))); sa(p.n, 'y2', f(lerp(p.a[1], p.a[3], k)));
      });
      wheels.forEach(function (w) { sa(w, 'r', f(10 * clamp(b / 0.1, 0, 1))); });
    };
  }

  function Tag(parent, str, x, y, bg, fg) {
    var g = G(parent), w = str.length * 22 + 52;
    Rc(g, 0, 0, w, 58, 29, bg);
    Tx(g, str, w / 2, 39, 25, 700, fg, 'middle', '0.14em');
    this.g = g; this.w = w; this.x = x; this.y = y;
    this.set = function (s, xx, yy) {
      show(g, s > 0.001);
      sa(g, 'transform', 'translate(' + f((xx == null ? x : xx) + w / 2) + ' ' + f((yy == null ? y : yy) + 29) + ') scale(' + f(s) + ') translate(' + f(-w / 2) + ' -29)');
    };
  }

  /* --- STRAAT: aankomen, kennismaken, steiger, en later de oplevering ----------------- */
  function StreetShot(st, parent, T) {
    var g = G(parent), cam = G(g), self = this, i;
    this.g = g; this.clip = new SlantClip(st, g);
    Rc(cam, -600, -400, 3200, 1300, 0, K.mintWash);
    var clouds = [[260, 96, 230, 56], [1180, 60, 180, 44], [1640, 130, 250, 60]].map(function (c) { return { n: Rc(cam, c[0], c[1], c[2], c[3], c[3] / 2, '#FFFFFF'), x: c[0] }; });
    var house = new House(st, cam);
    Rc(cam, -600, 860, 3200, 48, 0, K.walk); Rc(cam, -600, 904, 3200, 6, 0, '#CFCDC6'); Rc(cam, -600, 910, 3200, 400, 0, K.road);
    for (i = 0; i < 9; i++) Rc(cam, -500 + i * 330, 990, 150, 8, 4, '#FFFFFF', { opacity: 0.55 });
    // haag
    Rc(cam, 1150, 808, 436, 56, 24, K.hedge);
    for (i = 0; i < 7; i++) Ci(cam, 1185 + i * 62, 812, 26, i % 2 ? K.hedge : K.hedge2);
    Rc(cam, 1150, 836, 436, 28, 12, K.hedge);
    Rc(cam, 838, 822, 46, 42, 18, K.hedge2);
    var scaf = new Scaffold(cam);
    var back = G(cam);                                    // mensen achter de bus
    var wA = new Person(back, { shirt: K.ink, pants: K.inkSoft, skin: K.skin, hair: 'cap', hairColor: '#17191B', logo: true });
    var wB = new Person(back, { shirt: K.ink, pants: K.inkSoft, skin: '#EBC09C', hair: 'bun', hairColor: K.hair, logo: true });
    var cu = new Person(back, { shirt: K.mustard, pants: '#6C7B88', skin: '#EDC2A0', hair: 'short', hairColor: '#C9CED0' });
    var van = new Van(cam);
    // voor/na-scheidslijn en labels
    var divG = G(cam), divLine = Li(divG, 0, 0, 0, 0, '#FFFFFF', 8), tagNa = new Tag(divG, 'NA', 0, 0, K.mintDeep, '#FFFFFF'), tagVoor = new Tag(divG, 'VOOR', 0, 0, '#FFFFFF', K.rust);
    // pluspunten (schermruimte)
    var chips = ['10 jaar garantie op de folie', 'Opgeruimd achtergelaten', 'Gratis kozijncheck erbij'].map(function (s, k) {
      var cg = G(g), w = 0, tx;
      var bgR = Rc(cg, 0, 0, 100, 62, 31, '#FFFFFF'); Ci(cg, 31, 31, 16, K.mintDeep);
      Pa(cg, 'M23.5 31l5.4 5.8l9.6 -11.4', 'none', { stroke: '#FFFFFF', 'stroke-width': 3.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
      tx = Tx(cg, s, 60, 41, 25, 600, K.ink);
      return { g: cg, bg: bgR, tx: tx, s: s, y: 96 + k * 78 };
    });


    // ts = tijd sinds de straat in beeld kwam; tb = tijd sinds terugkeer na de close-up (of negatief)
    this.render = function (ts, tb) {
      var done = tb > 0, k, x;
      // camera
      var cz, cx, cy;
      if (!done) {
        cz = kf(ts, [[3.6, 1], [5.2, 1.3], [7.0, 1.3], [8.3, 1.12], [12.4, 1.12], [13.6, 1.3]]);
        cx = kf(ts, [[3.6, 960], [5.2, 930], [7.0, 930], [8.3, 1190], [12.4, 1190], [13.6, 1390]]);
        cy = kf(ts, [[3.6, 540], [5.2, 660], [7.0, 660], [8.3, 610], [12.4, 610], [13.6, 520]]);
      } else {
        cz = kf(tb, [[0, 1.12], [1.4, 1.0]]); cx = kf(tb, [[0, 1190], [1.4, 960]]); cy = kf(tb, [[0, 610], [1.4, 540]]);
      }
      sa(cam, 'transform', 'translate(960 540) scale(' + f(cz) + ') translate(' + f(-cx) + ' ' + f(-cy) + ')');
      clouds.forEach(function (c, j) { sa(c.n, 'x', f(c.x + (ts + (done ? 14 + tb : 0)) * (5 + j * 2))); });
      // bus rijdt voor
      var vq = seg(ts, 0.25, 2.5, E.out), vx = lerp(-720, 150, vq);
      van.set(vx, 922, 1, (vx + 720), 1.6 * Math.sin(Math.PI * seg(ts, 2.2, 0.9)) * (1 - seg(ts, 2.2, 0.9)));
      // deur
      house.setDoor(done ? 0 : kf(ts, [[4.2, 0], [4.7, 1], [12.75, 1], [13.2, 0]]));
      // --- monteur A (pet)
      var pA = { face: 1 };
      if (!done) {
        var a1 = seg(ts, 3.0, 1.9, E.inOut), a2 = seg(ts, 7.1, 1.5, E.inOut), climb = seg(ts, 12.0, 0.7, E.inOut);
        pA.x = lerp(lerp(590, 868, a1), 1330, a2) + climb * 60;
        pA.y = 862 - climb * (862 - scaf.platformY) - Math.sin(Math.PI * climb) * 40;
        pA.wt = Math.max(ww(a1), ww(a2));
        pA.o = seg(ts, 2.95, 0.25);
        var sh = seg(ts, 4.95, 0.35, E.out) * (1 - seg(ts, 6.75, 0.3, E.inOut));
        if (sh > 0) pA.a = [lerp(4, 62, sh), lerp(12, 28, sh) + 9 * Math.sin((ts - 5.3) * 15) * seg(ts, 5.3, 0.2) * (1 - seg(ts, 6.5, 0.2))];
        if (climb >= 1) { pA.a = [78 + 4 * Math.sin(ts * 5), 34]; pA.b = [58, 50]; }
      } else {
        var dn = seg(tb, 0.2, 0.7, E.inOut), wk = seg(tb, 0.9, 0.9, E.inOut);
        pA.x = lerp(1390, 1100, wk); pA.y = lerp(scaf.platformY, 862, dn) - Math.sin(Math.PI * dn) * 30;
        pA.face = wk > 0 && wk < 1 ? -1 : 1; pA.wt = ww(wk);
        k = seg(tb, 3.3, 0.4, E.out);
        if (k > 0) pA.a = [lerp(4, 152, k), lerp(12, 18, k) + 10 * Math.sin(tb * 9) * k];
      }
      wA.set(pA);
      // --- monteur B (knot)
      var pB = { face: 1, y: 862 };
      if (!done) {
        var b1 = seg(ts, 3.45, 1.2, E.inOut), b2 = seg(ts, 7.3, 1.5, E.inOut);
        pB.x = lerp(lerp(600, 742, b1), 1170, b2);
        pB.wt = Math.max(ww(b1), ww(b2));
        pB.o = seg(ts, 3.4, 0.25);
        k = seg(ts, 5.0, 0.4, E.out) * (1 - seg(ts, 6.8, 0.3, E.inOut));
        if (k > 0) pB.a = [lerp(4, 158, k), lerp(12, 24, k) + 16 * Math.sin(ts * 10) * k];
        if (ts > 9.2 && ts < 12.6) pB.a = [52, 78];
      } else {
        pB.x = 1010;
        k = seg(tb, 3.5, 0.4, E.out);
        if (k > 0) { pB.a = [lerp(4, 150, k), lerp(12, 20, k) - 10 * Math.sin(tb * 9) * k]; pB.b = [lerp(-2, 150, k), 20]; }
      }
      wB.set(pB);
      // --- klant
      var pC = { face: -1, y: 862 };
      if (!done) {
        var c1 = seg(ts, 4.45, 0.7, E.out), c2 = seg(ts, 7.2, 1.2, E.inOut), c3 = seg(ts, 11.8, 0.8, E.inOut);
        pC.x = lerp(lerp(lerp(958, 972, c1), 1060, c2), 958, c3); pC.o = Math.min(seg(ts, 4.4, 0.3), 1 - seg(ts, 12.5, 0.22));
        pC.face = (c2 > 0 && c2 < 1) ? 1 : (c3 > 0 ? -1 : (c2 >= 1 ? 1 : -1));
        pC.wt = Math.max(ww(c2), ww(c3)); pC.amp = 19; pC.stride = 128;
        var shc = seg(ts, 4.95, 0.35, E.out) * (1 - seg(ts, 6.75, 0.3, E.inOut));
        if (shc > 0) pC.a = [lerp(4, 62, shc), lerp(12, 28, shc) - 9 * Math.sin((ts - 5.3) * 15) * seg(ts, 5.3, 0.2) * (1 - seg(ts, 6.5, 0.2))];
        if (ts > 9.2 && ts < 11.8) pC.a = [52, 78];
      } else {
        pC.x = 1212; pC.face = -1; pC.o = seg(tb, 1.0, 0.3);
        k = seg(tb, 3.4, 0.4, E.out);
        if (k > 0) pC.a = [lerp(4, 150, k), lerp(12, 20, k) + 10 * Math.sin(tb * 9 + 1) * k];
      }
      cu.set(pC);
      // --- steiger
      scaf.set(done ? 1 - seg(tb, 0.9, 1.0) : seg(ts, 8.3, 2.2));
      // --- oplevering: schuine voor/na-veeg over de gevel
      var rv = done ? seg(tb, 1.5, 2.0, E.inOut) : 0, xe = lerp(760 - 870 * COT, 1660 - 330 * COT, rv);
      if (rv <= 0) show(house.newG, false);
      else { show(house.newG, true); if (rv >= 1) house.newClip.off(); else house.newClip.set(xe, -1); }
      var dv = done ? Math.min(seg(tb, 1.3, 0.3), 1 - seg(tb, 3.5, 0.3)) : 0;
      op(divG, dv);
      if (dv > 0) {
        sa(divLine, 'x1', f(xe + 300 * COT)); sa(divLine, 'y1', 300); sa(divLine, 'x2', f(xe + 880 * COT)); sa(divLine, 'y2', 880);
        tagNa.set(1, xe + 300 * COT - tagNa.w - 22, 232); tagVoor.set(1, xe + 300 * COT + 30, 232);
      }
      house.sparks.forEach(function (s, j) {
        var q = done ? ((tb - 3.3 - j * 0.23) / 1.5) : -1, on = q > 0 && tb < 7.5, qq = q % 1;
        show(s.n, on);
        if (on) sa(s.n, 'transform', 'translate(' + s.x + ' ' + s.y + ') rotate(' + f(qq * 90) + ') scale(' + f(Math.sin(Math.PI * qq) * 1.25) + ')');
      });
      chips.forEach(function (ch, j) {
        var s2 = done ? pop(tb, 3.7 + j * 0.42, 0.45) : 0;
        show(ch.g, s2 > 0.001);
        if (s2 > 0.001) {
          var w = textW(ch.tx, ch.s, 25) + 92;
          sa(ch.bg, 'width', f(w));
          sa(ch.g, 'transform', 'translate(96 ' + ch.y + ') scale(' + f(s2) + ')');
        }
      });
    };
  }

  /* --- de drie vaste werkstappen, rechtsboven in het close-up ----------------------------- */
  var STAP = [[1.5, 4.85], [4.85, 8.15], [8.15, 11.1]];
  function StappenPillen(outer) {
    var i;
    var stappen = ['Toplaag eraf', 'Reinigen en vetvrij', 'Nieuwe folie erop'].map(function (s2) { return { s: s2, w: Math.round(s2.length * 13.8 + 90) }; }), sx = 1824;
    for (i = stappen.length - 1; i >= 0; i--) { sx -= stappen[i].w; stappen[i].x = sx; sx -= 14; }
    stappen.forEach(function (sp, k2) {
      sp.g = G(outer);
      Rc(sp.g, 0, 8, sp.w, 58, 29, '#22262A', { opacity: 0.08 });
      sp.bg = Rc(sp.g, 0, 0, sp.w, 58, 29, '#FFFFFF');
      sp.dot = Ci(sp.g, 30, 29, 17, K.mintSoft);
      sp.nr = Tx(sp.g, String(k2 + 1), 30, 37, 21, 700, K.mintDeep, 'middle');
      sp.vink = Pa(sp.g, 'M22.5 29.5l5 5.3l9 -10.6', 'none', { stroke: '#FFFFFF', 'stroke-width': 3.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
      sp.tx = Tx(sp.g, sp.s, 58, 38, 23, 600, K.ink);
    });
    return stappen;
  }
  function stappenStand(stappen, tc) {
    stappen.forEach(function (sp, k2) {
      var a = pop(tc, 0.7 + k2 * 0.12, 0.4), nu = tc >= STAP[k2][0] && tc < STAP[k2][1], klaar = tc >= STAP[k2][1];
      show(sp.g, a > 0.001);
      sa(sp.g, 'transform', 'translate(' + f(sp.x + sp.w / 2) + ' 113) scale(' + f(a) + ') translate(' + f(-sp.w / 2) + ' -29)');
      sa(sp.bg, 'fill', nu ? K.mintDeep : '#FFFFFF');
      sa(sp.dot, 'fill', nu ? '#FFFFFF' : (klaar ? K.mintDeep : K.mintSoft));
      show(sp.nr, !klaar); show(sp.vink, klaar);
      sa(sp.tx, 'fill', nu ? '#FFFFFF' : K.ink); op(sp.tx, nu || klaar ? 1 : 0.62);
    });
  }

  /* --- CLOSE-UP: de vaste werkwijze in drie stappen ------------------------------------
   * In 3D (zie hieronder); dit platte close-up is alleen nog de terugval zonder WebGL.
   * 1 de toplaag (oude folie) gaat eraf, met warmte; 2 reinigen: de doek veegt de lijmresten weg,
   * er gaat ontvetter op en hij veegt nog een keer na; 3 de nieuwe folie rolt uit en de rakel drukt
   * hem aan. Rechtsboven lichten de drie stappen op terwijl ze gebeuren. */
  function CloseShot(st, parent) {
    var outer = G(parent), g = G(outer), i;
    this.g = outer; this.clip = new SlantClip(st, outer);
    // In 3D: hetzelfde kozijn als de hero op de homepage (kozijn3d.js en kozijn-klus.js, met WebGL).
    // Zonder die scripts of zonder WebGL: het platte close-up hieronder.
    var K3D = typeof window !== 'undefined' && window.iwrapKozijnKlus;
    if (K3D && K3D.kan()) {
      var fo = el('foreignObject', { x: 0, y: 0, width: 1920, height: 1080 }, outer);
      var cv3 = document.createElement('canvas'); cv3.width = 1920; cv3.height = 1080;
      cv3.setAttribute('style', 'display:block;width:1920px;height:1080px');
      fo.appendChild(cv3);
      var cx3 = cv3.getContext('2d');
      var tagV = new Tag(outer, 'VOOR', 96, 84, '#FFFFFF', K.rust), tagN = new Tag(outer, 'NA', 96, 84, K.mintDeep, '#FFFFFF');
      var st3 = StappenPillen(outer);
      this.render = function (tc) {
        K3D.teken(cx3, tc, 1920, 1080);
        tagV.set(pop(tc, 0.55, 0.4) * (1 - seg(tc, 4.9, 0.25, E.in)));
        tagN.set(pop(tc, 11.2, 0.45));
        stappenStand(st3, tc);
      };
      return;
    }
    var bid = st.id + 'b2', bp = el('pattern', { id: bid, patternUnits: 'userSpaceOnUse', width: 250, height: 124 }, st.defs);
    Rc(bp, 0, 0, 250, 124, 0, K.brick);
    Rc(bp, 0, 0, 250, 6, 0, '#FFFFFF', { opacity: 0.22 }); Rc(bp, 0, 62, 250, 6, 0, '#FFFFFF', { opacity: 0.22 });
    Rc(bp, 0, 0, 6, 62, 0, '#FFFFFF', { opacity: 0.22 }); Rc(bp, 125, 62, 6, 62, 0, '#FFFFFF', { opacity: 0.22 });
    Rc(bp, 24, 18, 80, 30, 3, '#000000', { opacity: 0.05 }); Rc(bp, 150, 82, 70, 28, 3, '#FFFFFF', { opacity: 0.06 });
    Rc(g, 0, 0, 1920, 1080, 0, 'url(#' + bid + ')');
    // glas
    var gid = st.id + 'cg', gg = el('linearGradient', { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 }, st.defs);
    el('stop', { offset: 0, 'stop-color': '#E3EEF0' }, gg); el('stop', { offset: 1, 'stop-color': '#BFD4D8' }, gg);
    Rc(g, 430, -20, 1540, 560, 0, 'url(#' + gid + ')');
    [[640, 150, 0.4], [860, 44, 0.28], [1340, 190, 0.3], [1600, 50, 0.22]].forEach(function (r) {
      Pa(g, 'M' + r[0] + ' -20L' + (r[0] + r[1]) + ' -20L' + f(r[0] + r[1] + 560 * COT) + ' 540L' + f(r[0] + 560 * COT) + ' 540Z', '#FFFFFF', { opacity: r[2] });
    });
    // dorpelstenen
    for (i = 0; i < 9; i++) { Rc(g, 236 + i * 238, 760, 230, 92, 6, K.tile); Rc(g, 236 + i * 238, 760, 230, 16, 6, '#FFFFFF', { opacity: 0.16 }); }
    Rc(g, 236, 846, 1700, 10, 0, '#000000', { opacity: 0.16 });
    // het kozijn als L-vorm: stijl + onderdorpel
    var FD = 'M250 -20L430 -20L430 540L1960 540L1960 760L250 760Z';
    Pa(g, FD, K.profile);
    for (i = 0; i < 4; i++) { Rc(g, 430, 584 + i * 46, 1540, 3, 0, '#FFFFFF', { opacity: 0.5 }); Rc(g, 286 + i * 36, -20, 3, 600, 0, '#FFFFFF', { opacity: 0.5 }); }
    var glueG = G(g); Pa(glueG, FD, K.glue);
    for (i = 0; i < 26; i++) Li(glueG, 270 + i * 66, 752, 270 + i * 66 + 40, 560, '#C99A22', 5, { opacity: 0.28 });
    var oldG = G(g); Pa(oldG, FD, K.creamOld);
    // schade aan de oude folie
    [[520, 600, 220, 60], [980, 640, 300, 90], [1500, 580, 240, 70], [290, 240, 80, 200], [1740, 660, 150, 70]].forEach(function (b) { el('ellipse', { cx: b[0] + b[2] / 2, cy: b[1] + b[3] / 2, rx: b[2] / 2, ry: b[3] / 2, fill: K.creamOldDark, opacity: 0.45 }, oldG); });
    ['M470 548l40 46l-18 40l52 44l-10 52', 'M900 760l-30 -60l44 -40l-36 -62l30 -58', 'M1400 540l26 60l-40 34l48 60l-22 66', 'M300 60l44 50l-30 60l40 70', 'M1700 548l-20 50l40 30'].forEach(function (d) {
      Pa(oldG, d, 'none', { stroke: '#8E7C55', 'stroke-width': 4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
      Pa(oldG, d, 'none', { stroke: '#FFFFFF', 'stroke-width': 1.6, 'stroke-linejoin': 'round', opacity: 0.35, transform: 'translate(4 2)' });
    });
    Pa(oldG, 'M1090 760L1070 690Q1120 650 1210 668L1290 700L1310 760Z', K.glue);                       // plek waar de folie al los is
    Pa(oldG, 'M1070 690Q1120 650 1210 668L1290 700Q1220 640 1130 630Q1080 640 1070 690Z', '#EDE3C7');   // opgekrulde flap
    Pa(oldG, 'M1070 690Q1120 650 1210 668L1290 700', 'none', { stroke: '#000000', 'stroke-width': 5, opacity: 0.14 });
    [[620, 700, 16], [680, 716, 10], [1560, 700, 14], [330, 420, 12]].forEach(function (b) { Ci(oldG, b[0], b[1], b[2], '#E6DBBB'); Ci(oldG, b[0] - b[2] * 0.3, b[1] - b[2] * 0.3, b[2] * 0.35, '#FFFFFF', { opacity: 0.5 }); });
    var newG = G(g); Pa(newG, FD, K.creamNew); Rc(newG, 430, 540, 1540, 8, 0, '#FFFFFF', { opacity: 0.7 }); Rc(newG, 422, -20, 8, 560, 0, '#FFFFFF', { opacity: 0.5 });
    var hid = st.id + 'ch', hg = el('linearGradient', { id: hid, gradientUnits: 'userSpaceOnUse' }, st.defs);
    el('stop', { offset: 0, 'stop-color': '#FFFFFF', 'stop-opacity': 0 }, hg); el('stop', { offset: 1, 'stop-color': '#FFFFFF', 'stop-opacity': 0.75 }, hg);
    var gloss = Pa(newG, FD, 'url(#' + hid + ')');
    var cGlue = new SlantClip(st, glueG), cOld = new SlantClip(st, oldG), cNew = new SlantClip(st, newG);
    // glaslat en rubber
    Rc(g, 430, 524, 1540, 18, 0, K.inkSoft); Rc(g, 426, -20, 18, 562, 0, K.inkSoft);
    Rc(g, 250, 758, 1720, 6, 0, '#000000', { opacity: 0.18 });
    // reinigen: na de lijm een nevel ontvetter, nog een keer nadoen, dan glanst de schone ondergrond
    var shid = st.id + 'cs', shg = el('linearGradient', { id: shid, gradientUnits: 'userSpaceOnUse' }, st.defs);
    el('stop', { offset: 0, 'stop-color': '#FFFFFF', 'stop-opacity': 0 }, shg); el('stop', { offset: 0.5, 'stop-color': '#FFFFFF', 'stop-opacity': 0.8 }, shg); el('stop', { offset: 1, 'stop-color': '#FFFFFF', 'stop-opacity': 0 }, shg);
    var shine = Pa(g, FD, 'url(#' + shid + ')');
    var rnd = rng(41), mist = G(g), drops = [];
    for (i = 0; i < 46; i++) { var dx = 300 + rnd() * 1620, dy = 572 + rnd() * 172; drops.push({ x: dx, y: dy, n: Ci(mist, dx, dy, 2.6 + rnd() * 4.4, '#FFFFFF', { opacity: 0.85 }) }); }
    // gereedschap
    var rollOld = G(g), ro1 = Li(rollOld, 0, 0, 0, 0, '#000000', 30, { opacity: 0.14 }), ro2 = Li(rollOld, 0, 0, 0, 0, K.creamOldDark, 30), ro3 = Li(rollOld, 0, 0, 0, 0, '#E3D7B6', 8);
    var cloth = G(g); Pa(cloth, 'M-70 -60Q0 -84 64 -58Q86 0 60 62Q-4 84 -66 58Q-88 0 -70 -60Z', '#FFFFFF'); Pa(cloth, 'M-30 -40Q10 -10 -14 36', 'none', { stroke: K.mintSoft, 'stroke-width': 9, 'stroke-linecap': 'round' }); Pa(cloth, 'M14 -44Q46 -6 26 40', 'none', { stroke: K.mintSoft, 'stroke-width': 9, 'stroke-linecap': 'round' });
    var cone = el('polygon', { points: '0,0 0,0 0,0', fill: K.mint, opacity: 0.28 }, g);
    var bottle = G(g);
    Rc(bottle, 46, 24, 70, 136, 20, K.mint); Rc(bottle, 46, 66, 70, 42, 0, '#FFFFFF', { opacity: 0.55 });
    Rc(bottle, 58, -2, 44, 34, 8, K.ink); Rc(bottle, -6, -16, 84, 30, 12, K.ink); Rc(bottle, 38, 10, 16, 44, 7, K.inkSoft);
    Rc(bottle, -2, -8, 26, 6, 3, '#FFFFFF', { opacity: 0.18 });
    var stappen = StappenPillen(outer);
    var rollNew = G(g), rn1 = Li(rollNew, 0, 0, 0, 0, '#000000', 30, { opacity: 0.14 }), rn2 = Li(rollNew, 0, 0, 0, 0, '#E7DFCC', 30), rn3 = Li(rollNew, 0, 0, 0, 0, '#FFFFFF', 8);
    var rak = G(g);
    Li(rak, 0, 6, 0, 6, '#000000', 60, { opacity: 0.12 });
    var rk = G(rak); Rc(rk, -40, -170, 80, 250, 16, K.rust); Rc(rk, -40, 40, 80, 60, 10, '#F4F2EC'); Rc(rk, -40, 40, 80, 10, 0, '#000000', { opacity: 0.1 }); Rc(rk, -22, -140, 44, 120, 10, '#FFFFFF', { opacity: 0.14 });
    var gun = G(g);
    Rc(gun, -210, -64, 250, 128, 44, K.inkSoft); Rc(gun, -50, 30, 96, 210, 30, '#2A2E32'); Rc(gun, -250, -42, 70, 84, 12, K.alu);
    Rc(gun, -196, -64, 26, 128, 0, K.rust); Rc(gun, -120, -30, 110, 12, 6, '#FFFFFF', { opacity: 0.14 });
    var heat = [0, 1, 2].map(function () { return el('path', { d: '', fill: 'none', stroke: K.rust, 'stroke-width': 9, 'stroke-linecap': 'round', opacity: 0.6 }, g); });
    var tagVoor = new Tag(g, 'VOOR', 96, 84, '#FFFFFF', K.rust), tagNa = new Tag(g, 'NA', 96, 84, K.mintDeep, '#FFFFFF');
    var sparks = [[700, 640], [1180, 610], [1640, 690], [340, 300], [960, 700]].map(function (p) { return { x: p[0], y: p[1], n: Pa(g, 'M0 -34Q4 -4 34 0Q4 4 0 34Q-4 4 -34 0Q-4 -4 0 -34Z', '#FFFFFF') }; });
    var X0 = -160, X1 = 1760;
    function roll(a, b, c, xe, w) {
      var ya = 520, yb = 782;
      [a, b, c].forEach(function (n, j) {
        var off = j === 0 ? 10 : 0;
        sa(n, 'x1', f(xe + ya * COT + off)); sa(n, 'y1', ya + off); sa(n, 'x2', f(xe + yb * COT + off)); sa(n, 'y2', yb + off);
        sa(n, 'stroke-width', f(j === 2 ? Math.max(3, w * 0.22) : w));
      });
    }
    this.render = function (tc) {
      var k, zz = 1 + 0.045 * seg(tc, 0, 13, E.inOut);
      sa(g, 'transform', 'translate(960 620) scale(' + f(zz) + ') translate(-960 -620)');
      // oude folie rolt op (met warmte)
      var pp = seg(tc, 1.7, 3.1, E.inOut), xp = lerp(X0, X1, pp);
      if (pp <= 0) cOld.off(); else cOld.set(xp, 1);
      show(oldG, pp < 1);
      var ro = Math.min(seg(tc, 1.5, 0.3), 1 - seg(tc, 4.75, 0.35));
      op(rollOld, ro);
      if (ro > 0) roll(ro1, ro2, ro3, xp + 18, lerp(34, 92, pp));
      var gp = Math.min(seg(tc, 0.9, 0.6, E.out), 1 - seg(tc, 4.6, 0.5, E.in)), gx = xp + 520 * COT + 470, gy = lerp(120, 330, gp);
      show(gun, gp > 0.001);
      sa(gun, 'transform', 'translate(' + f(gx) + ' ' + f(gy) + ') rotate(-34)');
      heat.forEach(function (n, j) {
        var on = gp > 0.6, bx = gx - 250 - j * 54, by = gy + 170 + j * 36, d = 'M' + f(bx) + ' ' + f(by), q;
        for (q = 0; q < 3; q++) d += 'q' + f(-18 + 14 * Math.sin(tc * 9 + j + q)) + ' 22 -22 44';
        sa(n, 'd', on ? d : ''); sa(n, 'opacity', f(0.3 + 0.3 * Math.sin(tc * 7 + j * 2)));
      });
      // stap 2, reinigen: de doek veegt de lijmresten weg; ontvetter erop; de doek veegt nog een keer na
      var cp2 = seg(tc, 4.9, 1.5, E.inOut), xc = lerp(X0, X1, cp2);
      if (cp2 <= 0) cGlue.off(); else cGlue.set(xc, 1);
      show(glueG, cp2 < 1);
      var cq = seg(tc, 6.9, 1.1, E.inOut), xc2 = lerp(X0, X1, cq), tweede = tc >= 6.6;
      k = tweede ? Math.min(seg(tc, 6.8, 0.2), 1 - seg(tc, 7.95, 0.2)) : Math.min(seg(tc, 4.8, 0.25), 1 - seg(tc, 6.3, 0.2));
      show(cloth, k > 0.001);
      sa(cloth, 'transform', 'translate(' + f((tweede ? xc2 : xc) + 650 * COT + 20) + ' ' + f(650 + 54 * Math.sin(tc * 16)) + ') scale(' + f(k) + ')');
      var bq = seg(tc, 6.3, 0.9, E.inOut), xn = lerp(X0 + 260, X1 + 260, bq), bk = Math.min(seg(tc, 6.12, 0.2), 1 - seg(tc, 7.12, 0.2));
      show(bottle, bk > 0.001); sa(bottle, 'transform', 'translate(' + f(xn) + ' 260) scale(' + f(bk * 1.7) + ')');
      var spuit = bk > 0.5 && bq > 0 && bq < 1, yb2 = 760, xb2 = xn - 10 - (yb2 - 258) * COT;
      show(cone, spuit); if (spuit) sa(cone, 'points', f(xn - 10) + ',258 ' + f(xb2 - 70) + ',' + yb2 + ' ' + f(xb2 + 70) + ',' + yb2);
      drops.forEach(function (d) {
        var nat = tc > 6.3 && d.x < xn - 10 - (d.y - 258) * COT, weg = tc >= 6.9 && d.x < xc2 + d.y * COT + 20;
        show(d.n, nat && !weg && tc < 8.1);
      });
      var sq = seg(tc, 7.75, 0.6, E.inOut);
      show(shine, sq > 0 && sq < 1);
      if (sq > 0 && sq < 1) { var xs = lerp(X0, X1 + 300, sq); sa(shg, 'x1', f(xs - 170 * UY)); sa(shg, 'y1', f(170 * UX)); sa(shg, 'x2', f(xs + 170 * UY)); sa(shg, 'y2', f(-170 * UX)); }
      // nieuwe folie rolt uit, rakel drukt aan
      var ap = seg(tc, 8.2, 2.5, E.inOut), xa = lerp(X0, X1, ap);
      show(newG, ap > 0);
      if (ap >= 1) cNew.off(); else if (ap > 0) cNew.set(xa, -1);
      var rn = Math.min(seg(tc, 8.0, 0.3), 1 - seg(tc, 10.6, 0.3));
      op(rollNew, rn);
      if (rn > 0) roll(rn1, rn2, rn3, xa + 16, lerp(96, 36, ap));
      var rp = seg(tc, 8.9, 2.6, E.inOut), xr = lerp(X0 - 120, X1 + 200, rp);
      k = Math.min(seg(tc, 8.8, 0.3), 1 - seg(tc, 11.4, 0.3));
      show(rak, k > 0.001);
      sa(rak, 'transform', 'translate(' + f(xr + 650 * COT) + ' 650) rotate(' + f(90 - THETA * 180 / Math.PI + 4 * Math.sin(tc * 5)) + ') scale(' + f(k) + ')');
      sa(hg, 'x1', f(xr - 260 * UY)); sa(hg, 'y1', f(260 * UX)); sa(hg, 'x2', f(xr)); sa(hg, 'y2', 0);
      show(gloss, rp > 0 && rp < 1);
      // labels en glinstering
      tagVoor.set(pop(tc, 0.55, 0.4) * (1 - seg(tc, 4.9, 0.25, E.in)));
      tagNa.set(pop(tc, 11.2, 0.45));
      stappenStand(stappen, tc);
      sparks.forEach(function (s, j) {
        var q = (tc - 11.3 - j * 0.18) / 1.2, on = q > 0 && q < 1;
        show(s.n, on);
        if (on) sa(s.n, 'transform', 'translate(' + s.x + ' ' + s.y + ') rotate(' + f(q * 90) + ') scale(' + f(Math.sin(Math.PI * q) * 1.3) + ')');
      });
    };
  }

  /* --- montage: alle delen achter elkaar ---------------------------------------------- */
  SC.klus.build = function (st, root, T, o) {
    T.close = T.street + 13.6; T.closeD = 13.0;
    T.back = T.close + T.closeD;
    T.mapOut = T.back + 7.4;
    T.end = T.mapOut + 3.6;
    var street = new StreetShot(st, root, T);
    var close = new CloseShot(st, root);
    var mapOut = new MapShot(st, root, { T: T, dest: o.dest });
    var mapClip = new SlantClip(st, mapOut.g);
    // eindkaart
    var endG = G(root), endClip = new SlantClip(st, endG), th = theme({ theme: 'mint' });
    Rc(endG, -400, -400, 2720, 1880, 0, K.mint);
    var mid = st.id + 'em', rg = el('radialGradient', { id: mid + 'g', gradientUnits: 'userSpaceOnUse', cx: 960, cy: 540, r: 1180 }, st.defs);
    el('stop', { offset: 0, 'stop-color': '#000' }, rg); el('stop', { offset: 0.4, 'stop-color': '#000' }, rg); el('stop', { offset: 1, 'stop-color': '#fff' }, rg);
    var msk = el('mask', { id: mid, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: 1920, height: 1080 }, st.defs);
    Rc(msk, 0, 0, 1920, 1080, 0, 'url(#' + mid + 'g)');
    var pat = new Pattern(G(endG, { mask: 'url(#' + mid + ')' }), 1920, 1080, th.pat, { patScale: 1.25, patLoop: 16, seed: 11 });
    var L = GEO.lockups.tagline, ls = 0.86, lg = G(endG, { transform: 'translate(' + f(960 - L.w * ls / 2) + ' ' + f(470 - L.h * ls / 2) + ') scale(' + ls + ')' });
    var logo = uitrolInto(st, lg, L, 'tagline', th, { outro: false, hold: 0, shift: true });
    var url = Tx(endG, 'iwrap.nl', 960, 792, 46, 600, '#FFFFFF', 'middle', '0.06em');
    var dur = T.end + 0.5 + logo.rest + 2.6;
    var captions = [
      { t0: T.street + 3.3, t1: T.street + 7.0, text: 'Je weet vooraf wie er komt, en wanneer.' },
      { t0: T.street + 8.5, t1: T.street + 12.6, text: 'Steiger op. Samen lopen we het kozijn na.' },
      { t0: T.close + 1.4, t1: T.close + 4.6, text: 'Oude folie eraf. Het kozijn blijft gewoon zitten.' },
      { t0: T.close + 5.1, t1: T.close + 7.8, text: 'Lijmresten eraf, alles vetvrij.' },
      { t0: T.close + 8.3, t1: T.close + 12.5, text: 'Nieuwe Renolit folie erop.' },
      { t0: T.back + 2.0, t1: T.mapOut - 0.3, text: 'Weer als nieuw.' },
      { t0: T.mapOut + 0.7, t1: T.end - 0.2, text: 'Door heel Nederland.' }
    ];
    return {
      captions: captions, duration: dur, irisOff: T.street + 0.95,
      render: function (t, rakel) {
        var ts = t - T.street, tc = t - T.close, tb = t - T.back, to = t - T.mapOut, te = t - T.end, WD = 0.85, p = 0, w;
        // straat
        var sOn = ts >= 0 && to < WD + 0.05;
        show(street.g, sOn);
        if (sOn) {
          street.render(ts, tb);
          w = seg(ts, 0, WD, E.inOut);
          if (w < 1) { street.clip.set(rakel.x(w), -1); p = w; } else street.clip.off();
        }
        // close-up: veegt erin, en later weer weg
        var cOn = tc >= 0 && tb < WD + 0.05;
        show(close.g, cOn);
        if (cOn) {
          close.render(tc);
          w = seg(tc, 0, WD, E.inOut);
          if (w < 1) { close.clip.set(rakel.x(w), -1); p = w; }
          else if (tb > 0) { w = seg(tb, 0, WD, E.inOut); close.clip.set(rakel.x(w), 1); p = w; }
          else close.clip.off();
        }
        // kaart, uitgezoomd
        var mOn = to >= 0 && te < WD + 0.05;
        show(mapOut.g, mOn);
        if (mOn) {
          mapOut.render(t, 'out', to);
          w = seg(to, 0, WD, E.inOut);
          if (w < 1) { mapClip.set(rakel.x(w), -1); p = w; } else mapClip.off();
        }
        // eindkaart
        var eOn = te >= 0;
        show(endG, eOn);
        if (eOn) {
          pat.render(te); logo.render(te - 0.75);
          op(url, seg(te, 0.75 + logo.rest - 0.9, 0.5)); sa(url, 'transform', 'translate(0 ' + f(18 * (1 - seg(te, 0.75 + logo.rest - 0.9, 0.7, E.out))) + ')');
          w = seg(te, 0, WD, E.inOut);
          if (w < 1) { endClip.set(rakel.x(w), -1); p = w; } else endClip.off();
        }
        rakel.draw(p);
      }
    };
  };


  /* ====================================================================== PAGINA'S
   * Animaties voor losse pagina's van iwrap.nl. Ontwerpruimte 1200 x 900 (4:3).
   * Ze spelen één keer af zodra ze in beeld komen en blijven staan op een eindbeeld
   * dat zonder beweging ook alles vertelt. Rechtsonder verschijnt dan een knop om opnieuw af te spelen.
   * ====================================================================== */

  var PW = 1200, PH = 900;
  var GREEN = '#4C9F70', GREY = '#D6D3CB', LINE = '#E3E1DB', NEWCREAM = '#F3E9D4', WHITE = '#FFFFFF';

  function PageStage(o, label, bg) {
    var W = o.frame ? o.frame[0] : PW, H = o.frame ? o.frame[1] : PH, s = Math.min(W / PW, H / PH);
    var st = Stage({ frame: o.frame, label: label }, W, H, theme({ theme: 'light' }));
    Rc(st.svg, 0, 0, W, H, 0, bg || K.paper);
    var root = G(st.svg, { transform: 'translate(' + f((W - PW * s) / 2) + ' ' + f((H - PH * s) / 2) + ') scale(' + f(s) + ')' });
    return { st: st, root: root };
  }
  function Card(p, x, y, w, h, r) {
    var g = G(p);
    Rc(g, x, y + 10, w, h, r || 28, '#22262A', { opacity: 0.07 });
    Rc(g, x, y, w, h, r || 28, WHITE);
    return g;
  }
  // vinkje of kruisje in een rondje; middelpunt op (0,0)
  function Badge(p, r, bg, kind) {
    var g = G(p), w = f(r * 0.24);
    Ci(g, 0, 0, r, bg || K.mintDeep);
    if (kind === 'x') {
      var a = f(r * 0.36);
      Pa(g, 'M' + (-a) + ' ' + (-a) + 'L' + a + ' ' + a + 'M' + a + ' ' + (-a) + 'L' + (-a) + ' ' + a, 'none', { stroke: WHITE, 'stroke-width': w, 'stroke-linecap': 'round' });
    } else Pa(g, 'M' + f(-r * 0.42) + ' ' + f(r * 0.02) + 'l' + f(r * 0.3) + ' ' + f(r * 0.32) + 'l' + f(r * 0.56) + ' ' + f(-r * 0.66), 'none', { stroke: WHITE, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    return g;
  }
  function place(n, x, y, s, rot) {
    if (s != null && s <= 0.001) { show(n, false); return; }
    show(n, true);
    sa(n, 'transform', 'translate(' + f(x) + ' ' + f(y) + ')' + (rot ? ' rotate(' + f(rot) + ')' : '') + (s != null && s !== 1 ? ' scale(' + f(s) + ')' : ''));
  }
  function ReplayBtn(p) {
    var g = G(p, { role: 'button', tabindex: '0', 'aria-label': 'Opnieuw afspelen', style: 'cursor:pointer' });
    Ci(g, 0, 0, 30, WHITE, { stroke: LINE, 'stroke-width': 2 });
    Pa(g, 'M9.2 -6.4A11.2 11.2 0 1 0 11 2.2', 'none', { stroke: K.ink, 'stroke-width': 3.4, 'stroke-linecap': 'round' });
    Pa(g, 'M3.4 -8.6L10 -7.2L10.4 -0.4', 'none', { stroke: K.ink, 'stroke-width': 3.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    return g;
  }
  function pageScene(ps, rest, render, o) {
    var btn = null;
    if (o.ui !== false) { btn = ReplayBtn(ps.root); place(btn, 1150, 852); }
    return {
      svg: ps.st.svg, duration: rest + (o.hold != null ? o.hold : 2.5), rest: rest, posterT: rest, replayBtn: btn,
      render: function (t) { render(t); if (btn) op(btn, seg(t, rest - 0.1, 0.4)); }
    };
  }
  function brick(st, scale, color) {
    var id = st.id + 'bk' + (++uid), w = 64 * scale, h = 32 * scale, m = 1.6 * scale;
    var bp = el('pattern', { id: id, patternUnits: 'userSpaceOnUse', width: f(w), height: f(h) }, st.defs);
    Rc(bp, 0, 0, w, h, 0, color || K.brick);
    Rc(bp, 0, 0, w, m, 0, WHITE, { opacity: 0.2 }); Rc(bp, 0, h / 2, w, m, 0, WHITE, { opacity: 0.2 });
    Rc(bp, 0, 0, m, h / 2, 0, WHITE, { opacity: 0.2 }); Rc(bp, w / 2, h / 2, m, h / 2, 0, WHITE, { opacity: 0.2 });
    Rc(bp, 6 * scale, 4 * scale, 22 * scale, 9 * scale, 1, '#000000', { opacity: 0.05 });
    Rc(bp, 38 * scale, 20 * scale, 20 * scale, 9 * scale, 1, WHITE, { opacity: 0.06 });
    return 'url(#' + id + ')';
  }
  function glassFill(st) {
    if (st.__glass) return st.__glass;
    var id = st.id + 'gl', gg = el('linearGradient', { id: id, x1: 0, y1: 0, x2: 0, y2: 1 }, st.defs);
    el('stop', { offset: 0, 'stop-color': K.glass1 }, gg); el('stop', { offset: 1, 'stop-color': K.glass2 }, gg);
    return (st.__glass = 'url(#' + id + ')');
  }
  // glas met twee schuine lichtstrepen onder de hoek van het logo
  function glassRect(st, p, x, y, w, h) {
    Rc(p, x, y, w, h, 2, glassFill(st));
    var cid = st.id + 'gc' + (++uid), cp = el('clipPath', { id: cid }, st.defs);
    Rc(cp, x, y, w, h, 2);
    var g = G(p, { 'clip-path': 'url(#' + cid + ')' });
    [[0.1, 0.24, 0.36], [0.46, 0.08, 0.26]].forEach(function (r) {
      var a = x + w * r[0] - 0.5 * h * COT, b = w * r[1];
      Pa(g, 'M' + f(a) + ' ' + f(y) + 'L' + f(a + b) + ' ' + f(y) + 'L' + f(a + b + h * COT) + ' ' + f(y + h) + 'L' + f(a + h * COT) + ' ' + f(y + h) + 'Z', WHITE, { opacity: r[2] });
    });
  }
  function rrD(x, y, w, h, r) {
    return 'M' + f(x + r) + ' ' + f(y) + 'h' + f(w - 2 * r) + 'a' + r + ' ' + r + ' 0 0 1 ' + r + ' ' + r + 'v' + f(h - 2 * r) +
      'a' + r + ' ' + r + ' 0 0 1 ' + (-r) + ' ' + r + 'h' + f(-(w - 2 * r)) + 'a' + r + ' ' + r + ' 0 0 1 ' + (-r) + ' ' + (-r) +
      'v' + f(-(h - 2 * r)) + 'a' + r + ' ' + r + ' 0 0 1 ' + r + ' ' + (-r) + 'Z';
  }
  function frameD(x, y, w, h, holes, r) { return rrD(x, y, w, h, r || 5) + holes.map(function (q) { return rrD(q[0], q[1], q[2], q[3], 2.5); }).join(''); }
  // verweerde folie, alleen op de profielen (t = dikte van het profiel): vlekken, haarscheurtjes en gele lijm
  function weather(p, x, y, w, h, seed, t) {
    var r = rng(seed || 3), i, k;
    t = t || 16;
    for (i = 0; i < 2; i++) el('ellipse', { cx: f(x + w * (0.18 + 0.6 * r())), cy: f(y + h - t / 2), rx: f(w * (0.06 + 0.05 * r())), ry: f(t * 0.28), fill: K.creamOldDark, opacity: 0.5 }, p);
    el('ellipse', { cx: f(x + w * (0.3 + 0.4 * r())), cy: f(y + t / 2), rx: f(w * 0.08), ry: f(t * 0.24), fill: K.creamOldDark, opacity: 0.4 }, p);
    el('ellipse', { cx: f(x + t / 2), cy: f(y + h * (0.35 + 0.3 * r())), rx: f(t * 0.26), ry: f(h * 0.07), fill: K.creamOldDark, opacity: 0.4 }, p);
    for (i = 0; i < 2; i++) {
      var cx = x + w * (0.15 + 0.55 * r()), cy = y + h - t * (0.3 + 0.4 * r()), d = 'M' + f(cx) + ' ' + f(cy);
      for (k = 0; k < 3; k++) { cx += 5 + 7 * r(); cy = clamp(cy + (r() - 0.5) * t * 0.6, y + h - t + 2, y + h - 2); d += 'L' + f(cx) + ' ' + f(cy); }
      Pa(p, d, 'none', { stroke: '#8E7C55', 'stroke-width': 1.5, 'stroke-linejoin': 'round', opacity: 0.85 });
    }
    Rc(p, x + w * (0.3 + 0.4 * r()), y + h - t * 0.62, 14 + 10 * r(), t * 0.32, 2, K.glue);
  }
  // punt op een gebroken lijn, q = 0..1 (op lengte)
  function polyAt(pts, q) {
    var L = 0, i, seglen = [];
    for (i = 1; i < pts.length; i++) { var d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seglen.push(d); L += d; }
    var want = clamp(q, 0, 1) * L;
    for (i = 0; i < seglen.length; i++) {
      if (want <= seglen[i] || i === seglen.length - 1) {
        var k = seglen[i] ? clamp(want / seglen[i], 0, 1) : 0;
        return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)];
      }
      want -= seglen[i];
    }
    return pts[pts.length - 1];
  }
  function polyD(pts, close) { return 'M' + pts.map(function (p) { return f(p[0]) + ' ' + f(p[1]); }).join('L') + (close ? 'Z' : ''); }
  function Sparks(p, list, size) {
    return list.map(function (q) { return { x: q[0], y: q[1], n: Pa(p, 'M0 -16Q2 -2 16 0Q2 2 0 16Q-2 2 -16 0Q-2 -2 0 -16Z', WHITE) }; });
  }
  function sparks(list, t, t0, dur, size) {
    list.forEach(function (s, j) {
      var q = (t - t0 - j * 0.16) / (dur || 1.1);
      if (q <= 0 || q >= 1) { show(s.n, false); return; }
      place(s.n, s.x, s.y, Math.sin(Math.PI * q) * (size || 1.1), q * 90);
    });
  }
  // tekstpil die van tekst wisselt (onderschrift binnen een animatie)
  function Caption(p, list, cx, cy, w) {
    var g = G(p);
    Rc(g, cx - w / 2, cy - 33 + 8, w, 66, 33, '#22262A', { opacity: 0.08 });
    var bg = Rc(g, cx - w / 2, cy - 33, w, 66, 33, WHITE);
    Ci(g, cx - w / 2 + 34, cy, 9, K.mint);
    var items = list.map(function (c) { return { c: c, n: Tx(g, c.text, cx + 12, cy + 9, 26, 600, K.ink, 'middle') }; });
    return function (t) {
      op(g, seg(t, list[0].t0 - 0.2, 0.4));
      items.forEach(function (it) {
        var a = Math.min(seg(t, it.c.t0, 0.35), it.c.t1 != null ? 1 - seg(t, it.c.t1 - 0.3, 0.3) : 1);
        op(it.n, a); sa(it.n, 'transform', 'translate(0 ' + f(10 * (1 - E.out(seg(t, it.c.t0, 0.5)))) + ')');
      });
    };
  }

  /* ---------------------------------------------------------------- 1. WERKGEBIED
   * Kaart met alle plaatsen waar iWrap gewerkt heeft. Per regio komen aanvragen binnen,
   * die worden gebundeld tot één rit vanuit Hilversum. Loopt door drie regio's heen.
   */
  var PLACES = [['Hilversum', 5.176, 52.224], ['Amsterdam', 4.895, 52.370], ['Haarlem', 4.646, 52.387], ['Alkmaar', 4.749, 52.632], ['Hoorn', 5.059, 52.642],
    ['Amstelveen', 4.864, 52.308], ['Purmerend', 4.959, 52.505], ['Utrecht', 5.122, 52.091], ['Amersfoort', 5.387, 52.156], ['Maartensdijk', 5.174, 52.155],
    ['Veenendaal', 5.555, 52.028], ['Zeist', 5.233, 52.089], ['Nieuwegein', 5.083, 52.029], ['Putten', 5.607, 52.259], ['Apeldoorn', 5.970, 52.211],
    ['Arnhem', 5.911, 51.985], ['Nijmegen', 5.865, 51.842], ['Ede', 5.666, 52.040], ['Harderwijk', 5.620, 52.342], ['Zutphen', 6.196, 52.143],
    ['Rotterdam', 4.479, 51.922], ['Den Haag', 4.300, 52.070], ['Leiden', 4.497, 52.160], ['Dordrecht', 4.690, 51.813], ['Gouda', 4.708, 52.011],
    ['Zoetermeer', 4.493, 52.061], ['Eindhoven', 5.479, 51.441], ['Tilburg', 5.091, 51.556], ['Breda', 4.776, 51.589], ['Den Bosch', 5.305, 51.690],
    ['Langenboom', 5.718, 51.716], ['Helmond', 5.661, 51.481], ['Middelburg', 3.611, 51.499], ['Vlissingen', 3.573, 51.442], ['Goes', 3.889, 51.504],
    ['Terneuzen', 3.828, 51.336], ['Zwolle', 6.094, 52.516], ['Enschede', 6.894, 52.221], ['Deventer', 6.163, 52.255], ['Almere', 5.222, 52.371],
    ['Lelystad', 5.471, 52.518], ['Groningen', 6.567, 53.219], ['Leeuwarden', 5.799, 53.201], ['Assen', 6.562, 52.993], ['Maastricht', 5.690, 50.851],
    ['Venlo', 6.172, 51.370], ['Roermond', 5.988, 51.194]];
  var RITTEN = [
    { titel: 'Rit naar Zeeland', stops: [['Goes', '4 kozijnen'], ['Middelburg', '2 onderdorpels'], ['Terneuzen', 'Een voordeur']],
      via: [[[5.05, 52.06], [4.78, 51.84], [4.42, 51.62], [4.14, 51.47]], [[3.75, 51.50]], [[3.70, 51.45], [3.80, 51.40]]] },
    { titel: 'Rit naar het noorden', stops: [['Assen', 'Een schuifpui'], ['Groningen', '6 kozijnen'], ['Leeuwarden', 'Een dakkapel']],
      via: [[[5.40, 52.20], [5.64, 52.33], [6.09, 52.52], [6.30, 52.73]], [[6.58, 53.11]], [[6.20, 53.20]]] },
    { titel: 'Rit naar Limburg', stops: [['Venlo', '3 kozijnen'], ['Roermond', '2 onderdorpels'], ['Maastricht', 'Een dakkapel']],
      via: [[[5.12, 52.02], [5.30, 51.73], [5.50, 51.46], [5.85, 51.40]], [[6.09, 51.27]], [[5.86, 51.03]]] }
  ];
  function prj(lon, lat) { return [(lon - 5.30) * 0.61291 * 300, -(lat - 52.15) * 300]; }

  SC.werkgebied = function (o) {
    var ps = PageStage(o, 'Kaart: wij komen door heel Nederland en bundelen klussen per regio'), st = ps.st, R = ps.root;
    var MS = 0.95, MX = 840, MY = 455;
    function D(p) { return [MX + MS * (p[0] + 5.15), MY + MS * (p[1] + 1)]; }
    var byName = {}; PLACES.forEach(function (p) { byName[p[0]] = prj(p[1], p[2]); });
    // kaart
    var world = G(R, { transform: 'translate(' + f(MX + MS * 5.15) + ' ' + f(MY + MS) + ') scale(' + MS + ')' });
    var landG = G(world), landD = NL.land.map(ringD).join('');
    Pa(landG, landD, '#E2E9E5', { transform: 'translate(0 7)' });
    Pa(landG, landD, K.mint, { stroke: K.mint, 'stroke-width': 2.4, 'stroke-linejoin': 'round' });
    Pa(landG, ringD(NL.lake), K.paper);
    Pa(landG, ringD(NL.flevo), '#E2E9E5', { transform: 'translate(0 5)' });
    Pa(landG, ringD(NL.flevo), K.mint, { stroke: K.mint, 'stroke-width': 1.6, 'stroke-linejoin': 'round' });
    var clip = new SlantClip(st, landG), routeG = G(world, { fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    // plaatsen
    var HOME = D(byName.Hilversum), pinsG = G(R), pins = [], maxD = 1;
    PLACES.forEach(function (p) {
      if (p[0] === 'Hilversum') return;
      var q = D(byName[p[0]]), d = Math.hypot(q[0] - HOME[0], q[1] - HOME[1]);
      maxD = Math.max(maxD, d);
      pins.push({ name: p[0], x: q[0], y: q[1], d: d, n: Ci(pinsG, q[0], q[1], 0, WHITE, { stroke: K.mintDeep, 'stroke-width': 1.6 }) });
    });
    var homeG = G(R);
    Ci(homeG, 0, 3, 25, '#22262A', { opacity: 0.12 }); Ci(homeG, 0, 0, 25, WHITE, { stroke: K.mintDeep, 'stroke-width': 1.8 });
    new Mark(G(homeG, { transform: 'translate(-16 -8.6) scale(0.108)' }), K.mint);
    // ritten: route, nummers op de kaart, regels in de planning
    var cardG = G(R), markG = G(R), vanG = G(R);
    Card(cardG, 56, 196, 414, 470, 30);
    Tx(cardG, 'PLANNING', 92, 254, 18, 600, K.mintInk, 'start', '0.22em');
    Li(cardG, 92, 594, 434, 594, LINE, 2);
    var foot = Badge(cardG, 13, K.mintDeep); place(foot, 105, 628);
    Tx(cardG, 'Reiskosten zitten in de prijs', 128, 636, 21, 600, K.ink);
    var legG = G(R);
    Ci(legG, 74, 718, 7, WHITE, { stroke: K.mintDeep, 'stroke-width': 1.6 });
    Tx(legG, 'Plaatsen waar we al gewerkt hebben', 94, 725, 20, 500, K.sub);
    Ci(legG, 74, 760, 12, WHITE, { stroke: K.mintDeep, 'stroke-width': 1.6 });
    new Mark(G(legG, { transform: 'translate(66.3 755.8) scale(0.052)' }), K.mint);
    Tx(legG, 'Thuisbasis Hilversum', 94, 767, 20, 500, K.sub);
    var ritten = RITTEN.map(function (rt) {
      var g = G(cardG), stops = rt.stops.map(function (s) { return byName[s[0]]; });
      Tx(g, rt.titel, 92, 300, 30, 700, K.ink);
      var rows = rt.stops.map(function (s, i) {
        var y = 334 + i * 84, rg = G(g);
        var num = G(rg); Ci(num, 0, 0, 18, K.ink); Tx(num, String(i + 1), 0, 7, 19, 700, WHITE, 'middle'); place(num, 110, y + 30);
        var ok = Badge(rg, 18, K.mintDeep);
        Tx(rg, s[0], 144, y + 26, 25, 600, K.ink); Tx(rg, s[1], 144, y + 55, 20, 500, K.sub);
        return { g: rg, num: num, ok: ok, y: y };
      });
      var legs = [0, 1, 2].map(function (i) {
        var a = i === 0 ? byName.Hilversum : stops[i - 1], pts = [a].concat(rt.via[i].map(function (v) { return prj(v[0], v[1]); })).concat([stops[i]]);
        return { r: new Route(pts, 10), bg: Pa(routeG, '', 'none', { stroke: WHITE, 'stroke-width': 6, opacity: 0.6 }), ln: Pa(routeG, '', 'none', { stroke: K.mintDeep, 'stroke-width': 3.6 }) };
      });
      var mk = stops.map(function (s, i) {
        var q = D(s), m = G(markG);
        var rings = [0, 1].map(function () { return Ci(m, 0, 0, 0, 'none', { stroke: K.ink, 'stroke-width': 1.6 }); });
        var num = G(m); Ci(num, 0, 0, 13, K.ink); Tx(num, String(i + 1), 0, 5, 15, 700, WHITE, 'middle');
        var ok = Badge(m, 14, K.mintDeep);
        return { x: q[0], y: q[1], g: m, rings: rings, num: num, ok: ok };
      });
      var xs = mk.map(function (m) { return m.x; }), ys = mk.map(function (m) { return m.y; });
      var ex = (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2, ey = (Math.min.apply(null, ys) + Math.max.apply(null, ys)) / 2;
      var erx = (Math.max.apply(null, xs) - Math.min.apply(null, xs)) / 2 + 40, ery = (Math.max.apply(null, ys) - Math.min.apply(null, ys)) / 2 + 36;
      var ring = el('ellipse', { cx: f(ex), cy: f(ey), rx: f(erx), ry: f(ery), fill: K.ink, 'fill-opacity': 0.04, stroke: K.ink, 'stroke-width': 2, 'stroke-dasharray': '7 7' }, markG);
      return { g: g, rows: rows, legs: legs, mk: mk, ring: ring };
    });
    var VS = 0.068;
    Ci(vanG, 0, 3, 27, '#22262A', { opacity: 0.12 }); Ci(vanG, 0, 0, 27, WHITE, { stroke: K.mintDeep, 'stroke-width': 1.6 });
    var van = new Van(G(vanG));
    van.set(-270 * VS, 152 * VS, VS, 0, 0);

    var T0 = 1.7, CYC = 7.6, LOOP = CYC * 3;
    var LEG = [[1.3, 1.9], [3.65, 0.8], [4.9, 0.8]], ARR = [3.2, 4.45, 5.7];
    function render(t) {
      var lp = seg(t, 0.05, 1.0, E.inOut);
      if (lp >= 1) clip.off(); else clip.set(lerp(-560, 620, lp), -1);
      place(homeG, HOME[0], HOME[1], pop(t, 0.3, 0.5));
      pins.forEach(function (p) { sa(p.n, 'r', f(6.2 * pop(t, 0.45 + (p.d / maxD) * 1.0, 0.4))); });
      var ci = E.out(seg(t, 0.5, 0.7));
      op(cardG, seg(t, 0.5, 0.4)); sa(cardG, 'transform', 'translate(' + f(-28 * (1 - ci)) + ' 0)');
      op(legG, seg(t, 1.1, 0.5));
      var u = t < T0 ? -1 : (t - T0) % LOOP, k = u < 0 ? -1 : Math.floor(u / CYC), tc = u - k * CYC;
      ritten.forEach(function (rt, j) {
        var on = j === k;
        show(rt.g, on); show(rt.ring, on);
        rt.mk.forEach(function (m) { show(m.g, on); });
        rt.legs.forEach(function (l) { show(l.ln, on); show(l.bg, on); });
        if (!on) return;
        var out = seg(tc, CYC - 0.9, 0.6, E.inOut);
        op(rt.g, Math.min(seg(tc, 0, 0.35), 1 - out));
        rt.rows.forEach(function (r, i) {
          var a = seg(tc, 0.1 + i * 0.12, 0.4);
          op(r.g, a); sa(r.g, 'transform', 'translate(0 ' + f(10 * (1 - E.out(a))) + ')');
          var ok = pop(tc, ARR[i], 0.4);
          place(r.ok, 110, r.y + 30, ok); place(r.num, 110, r.y + 30, ok > 0.02 ? 0 : 1);
        });
        op(rt.ring, Math.min(seg(tc, 0.45, 0.4), 1 - out) * 0.9);
        rt.mk.forEach(function (m, i) {
          var a = pop(tc, 0.05 + i * 0.18, 0.45) * (1 - out), ok = pop(tc, ARR[i], 0.4);
          place(m.g, m.x, m.y, a);
          place(m.num, 0, 0, ok > 0.02 ? 0 : 1); place(m.ok, 0, 0, ok);
          m.rings.forEach(function (n, q) {
            var w = ((tc - 0.3) / 1.3 + q / 2) % 1, live = tc > 0.3 && tc < ARR[i];
            sa(n, 'r', f(live ? 13 + w * 22 : 0)); sa(n, 'opacity', f(live ? (1 - w) * 0.5 : 0));
          });
        });
        rt.legs.forEach(function (l, i) {
          var q = seg(tc, LEG[i][0], LEG[i][1], E.inOut);
          sa(l.ln, 'd', q > 0 ? l.r.d(q) : ''); sa(l.bg, 'd', q > 0 ? l.r.d(q) : '');
          op(l.ln, 1 - out); op(l.bg, (1 - out) * 0.6);
        });
        // busje
        var vp = byName.Hilversum, i;
        for (i = 0; i < 3; i++) if (tc >= LEG[i][0]) vp = rt.legs[i].r.at(seg(tc, LEG[i][0], LEG[i][1], E.inOut));
        var vq = D(vp), vs = pop(tc, 1.0, 0.4) * (1 - seg(tc, 6.3, 0.4, E.in));
        place(vanG, vq[0], vq[1], vs);
        var fp = pop(tc, 5.95, 0.45);
        place(foot, 105, 628, 1 + 0.25 * Math.sin(Math.PI * clamp(fp, 0, 1)));
      });
      if (k < 0) show(vanG, false);
    }
    var btnless = { ui: false };
    var sc = pageScene(ps, T0 + LOOP, render, btnless);
    sc.endless = true; sc.introDur = T0; sc.loopDur = LOOP; sc.duration = T0 + LOOP; sc.posterT = T0 + 6.0;
    return sc;
  };

  /* ---------------------------------------------------------------- 2. KOZIJNCHECK
   * Een vergrootglas loopt de zes onderdelen langs; in het rapport ernaast krijgt elk onderdeel zijn stoplicht.
   */
  SC.kozijncheck = function (o) {
    var ps = PageStage(o, 'Kozijncheck: zes onderdelen, elk met een stoplicht'), st = ps.st, R = ps.root;
    var wall = G(R), ink2 = '#3B4247';
    Rc(wall, 40, 70, 600, 770, 30, brick(st, 1.05));
    // rolluikkast
    Rc(wall, 146, 118, 388, 62, 6, '#D5DADB'); Rc(wall, 146, 170, 388, 10, 0, '#B9C3C6');
    [136, 151].forEach(function (y) { Li(wall, 160, y, 520, y, '#C2C9CB', 3); });
    // kitnaad, met rechtsonder een vergeelde, licht gekrompen strook
    Rc(wall, 145, 177, 390, 518, 7, 'none', { stroke: '#E4E0D6', 'stroke-width': 9 });
    Pa(wall, 'M420 695L534 695L534 590', 'none', { stroke: '#C9AE72', 'stroke-width': 9, 'stroke-linecap': 'round' });
    [[452, 695], [492, 695], [534, 660], [534, 622]].forEach(function (p) { Ci(wall, p[0], p[1], 2.6, '#7A5B2E'); });
    // kozijn in antracietgrijs (net hersteld), vast glas links, draairaam rechts
    Pa(wall, frameD(150, 182, 380, 508, [[172, 204, 156, 464], [342, 204, 166, 464]], 6), ink2, { 'fill-rule': 'evenodd' });
    glassRect(st, wall, 172, 204, 156, 464);
    Pa(wall, frameD(342, 204, 166, 464, [[362, 224, 126, 424]], 4), '#465056', { 'fill-rule': 'evenodd' });
    glassRect(st, wall, 362, 224, 126, 424);
    // hor over het draairaam
    var mid = st.id + 'mesh', mp = el('pattern', { id: mid, patternUnits: 'userSpaceOnUse', width: 7, height: 7 }, st.defs);
    Li(mp, 0, 0, 7, 0, '#55636A', 1); Li(mp, 0, 0, 0, 7, '#55636A', 1);
    Rc(wall, 370, 232, 110, 408, 3, 'url(#' + mid + ')', { opacity: 0.3 });
    Rc(wall, 370, 232, 110, 408, 3, 'none', { stroke: '#AEB8BB', 'stroke-width': 5 });
    // rubbers
    Rc(wall, 174, 206, 152, 460, 2, 'none', { stroke: '#141618', 'stroke-width': 4.5 });
    Rc(wall, 364, 226, 122, 420, 2, 'none', { stroke: '#141618', 'stroke-width': 4.5 });
    // hang- en sluitwerk
    Rc(wall, 491, 412, 11, 26, 4, '#B4BCBF'); Rc(wall, 493, 430, 8, 56, 4, '#C9CED0');
    Rc(wall, 338, 252, 7, 32, 3, '#9AA4A8'); Rc(wall, 338, 596, 7, 32, 3, '#9AA4A8');
    // vensterbank
    Rc(wall, 128, 690, 424, 24, 4, K.tile); Rc(wall, 128, 690, 424, 6, 3, WHITE, { opacity: 0.18 });

    var parts = [
      { name: 'Rubbers', status: 'Soepel en sluitend', col: GREEN, at: [326, 450] },
      { name: 'Kitwerk', status: 'Licht gekrompen', col: K.gold, at: [528, 668] },
      { name: 'Glas', status: 'Helder en heel', col: GREEN, at: [250, 330] },
      { name: 'Hang- en sluitwerk', status: 'Sluit soepel', col: GREEN, at: [497, 450] },
      { name: 'Horren', status: 'Past en oogt goed', col: GREEN, at: [425, 320] },
      { name: 'Rolluiken', status: 'Werkt goed', col: GREEN, at: [340, 149] }
    ];
    var pulse = Ci(R, 0, 0, 0, 'none', { stroke: WHITE, 'stroke-width': 5 });
    var lens = G(R);
    Li(lens, 36, 36, 84, 84, '#22262A', 16); Li(lens, 40, 40, 82, 82, '#3A4047', 9);
    Ci(lens, 0, 0, 52, WHITE, { 'fill-opacity': 0.16, stroke: '#22262A', 'stroke-width': 9 });
    Pa(lens, 'M-30 -14A32 32 0 0 1 -12 -32', 'none', { stroke: WHITE, 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0.8 });
    // rapport
    var card = G(R);
    Card(card, 690, 66, 460, 770, 30);
    Tx(card, 'OPLEVERRAPPORT', 724, 124, 18, 600, K.mintInk, 'start', '0.22em');
    Tx(card, 'Kozijncheck', 724, 172, 36, 700, K.ink);
    Tx(card, 'Zes onderdelen, elk met een stoplicht', 724, 206, 19, 500, K.sub);
    Li(card, 724, 232, 1116, 232, LINE, 2);
    var rows = parts.map(function (p, i) {
      var y = 244 + i * 80, g = G(card);
      var hl = Rc(g, 708, y + 4, 424, 72, 16, K.mintWash);
      Tx(g, p.name, 728, y + 36, 24, 600, K.ink);
      var pend = Tx(g, 'nog te bekijken', 728, y + 62, 19, 500, '#A9A59C');
      var stat = Tx(g, p.status, 728, y + 62, 19, 500, K.sub);
      Ci(g, 1108, y + 40, 13, GREY);
      var dot = Ci(g, 1108, y + 40, 0, p.col);
      return { g: g, hl: hl, pend: pend, stat: stat, dot: dot, y: y };
    });
    var sum = G(card), segs = [];
    Tx(sum, '5 van de 6 onderdelen in orde', 724, 774, 22, 700, K.ink);
    for (var i = 0; i < 6; i++) { Rc(sum, 724 + i * 68, 794, 60, 10, 5, GREY); segs.push(Rc(sum, 724 + i * 68, 794, 0, 10, 5, parts[i].col)); }

    var T1 = 1.0, STEP = 1.3, last = T1 + 5 * STEP, rest = last + 1.9;
    function render(t) {
      var a = E.out(seg(t, 0.15, 0.7));
      op(card, seg(t, 0.15, 0.5)); sa(card, 'transform', 'translate(0 ' + f(24 * (1 - a)) + ')');
      rows.forEach(function (r, i) { op(r.g, seg(t, 0.35 + i * 0.06, 0.4)); });
      // vergrootglas
      var pos = [980, 980], j;
      for (j = 0; j < parts.length; j++) {
        var ti = T1 + j * STEP, from = j ? parts[j - 1].at : [760, 1000];
        if (t >= ti - 0.55) { var q = seg(t, ti - 0.55, 0.55, E.inOut); pos = [lerp(from[0], parts[j].at[0], q), lerp(from[1], parts[j].at[1], q)]; }
      }
      if (t > last + 0.45) { var qo = seg(t, last + 0.45, 0.5, E.in); pos = [lerp(parts[5].at[0], 800, qo), lerp(parts[5].at[1], 1040, qo)]; }
      place(lens, pos[0], pos[1], t < 0.3 ? 0 : 1);
      // per onderdeel: puls, regel oplichten, stoplicht
      var pon = false;
      parts.forEach(function (p, i) {
        var ti = T1 + i * STEP, r = rows[i];
        op(r.hl, Math.min(seg(t, ti - 0.2, 0.25), 1 - seg(t, ti + STEP - 0.25, 0.25)));
        sa(r.dot, 'r', f(13 * pop(t, ti + 0.15, 0.4)));
        op(r.pend, 1 - seg(t, ti + 0.15, 0.25)); op(r.stat, seg(t, ti + 0.2, 0.3));
        var q = seg(t, ti, 0.75);
        if (q > 0 && q < 1) { pon = true; sa(pulse, 'cx', p.at[0]); sa(pulse, 'cy', p.at[1]); sa(pulse, 'r', f(40 + 50 * E.out(q))); sa(pulse, 'opacity', f((1 - q) * 0.9)); }
      });
      show(pulse, pon);
      op(sum, seg(t, last + 0.7, 0.4));
      segs.forEach(function (s, i) { sa(s, 'width', f(60 * seg(t, last + 0.8 + i * 0.09, 0.3, E.out))); });
    }
    return pageScene(ps, rest, render, o);
  };

  /* ---------------------------------------------------------------- 3. HERSTELLEN TEGENOVER VERVANGEN
   * Links wordt het kozijn eruit gebroken en vervangen, rechts gaat er alleen een laag folie af en weer op.
   */
  SC.vervangen = function (o) {
    var ps = PageStage(o, 'Een nieuw kozijn tegenover herstellen met folie'), st = ps.st, R = ps.root;
    var bk = brick(st, 0.95);
    function panel(x0, title, dot) {
      var g = G(R), P = { g: g, x0: x0 };
      Card(g, x0, 36, 546, 828, 30);
      Ci(g, x0 + 46, 92, 10, dot);
      Tx(g, title, x0 + 68, 101, 28, 700, K.ink);
      var cid = st.id + 'pw' + (++uid), cp = el('clipPath', { id: cid }, st.defs);
      Rc(cp, x0 + 30, 136, 486, 424, 20);
      P.scene = G(g, { 'clip-path': 'url(#' + cid + ')' });
      Rc(P.scene, x0 + 30, 136, 486, 424, 0, bk);
      P.chip = G(g); Rc(P.chip, x0 + 376, 160, 128, 44, 22, '#22262A', { opacity: 0.12, transform: 'translate(0 4)' }); P.chipBg = Rc(P.chip, x0 + 376, 160, 128, 44, 22, WHITE);
      P.chipTx = [];
      return P;
    }
    function chipText(P, s, col) { var n = Tx(P.chip, s, P.x0 + 440, 189, 21, 700, col || K.ink, 'middle'); P.chipTx.push(n); return n; }
    function windowAt(p, x0, col, old, seed) {
      var g = G(p), fx = x0 + 108, fy = 196;
      glassRect(st, g, fx + 18, fy + 18, 134, 268);
      glassRect(st, g, fx + 184, fy + 34, 112, 236);
      Pa(g, frameD(fx, fy, 330, 304, [[fx + 18, fy + 18, 134, 268], [fx + 166, fy + 18, 146, 268]]), col, { 'fill-rule': 'evenodd' });
      Pa(g, frameD(fx + 166, fy + 18, 146, 268, [[fx + 184, fy + 34, 112, 236]], 3), col, { 'fill-rule': 'evenodd' });
      Pa(g, 'M' + (fx + 166) + ' ' + (fy + 18) + 'h146v268h-146Z', 'none', { stroke: '#000000', 'stroke-opacity': 0.14, 'stroke-width': 1.5 });
      Rc(g, fx + 296, fy + 140, 8, 34, 4, '#C9CED0');
      if (old) { weather(g, fx, fy, 330, 304, seed, 18); weather(g, fx + 166, fy + 18, 146, 268, seed + 7, 16); }
      return g;
    }
    function bullets(P, list, kind, col) {
      return list.map(function (s, i) {
        var g = G(P.g), y = 612 + i * 60, b = Badge(g, 15, col, kind);
        place(b, P.x0 + 54, y);
        Tx(g, s, P.x0 + 82, y + 8, 22, 600, K.ink);
        return g;
      });
    }
    // ---- links: vervangen
    var L = panel(36, 'Een nieuw kozijn', K.rust), lx = 36;
    var hp = [], r0 = rng(4), X1 = lx + 100, X2 = lx + 446, Y1 = 188, Y2 = 508, q0;
    for (q0 = 0; q0 <= 8; q0++) hp.push([lerp(X1, X2, q0 / 8), Y1 + (r0() - 0.5) * 9]);
    for (q0 = 1; q0 <= 5; q0++) hp.push([X2 + (r0() - 0.5) * 9, lerp(Y1, Y2, q0 / 6)]);
    for (q0 = 8; q0 >= 0; q0--) hp.push([lerp(X1, X2, q0 / 8), Y2 + (r0() - 0.5) * 9]);
    for (q0 = 5; q0 >= 1; q0--) hp.push([X1 + (r0() - 0.5) * 9, lerp(Y1, Y2, q0 / 6)]);
    var hole = G(L.scene); Pa(hole, polyD(hp, true), '#33383D'); Rc(hole, lx + 120, 420, 306, 80, 0, '#3E444A');
    var cracks = ['M' + (lx + 100) + ' 260l-28 18l-12 30l-22 8', 'M' + (lx + 446) + ' 220l26 -14l10 -26l20 -8', 'M' + (lx + 120) + ' 506l-18 22l-30 6',
      'M' + (lx + 430) + ' 506l22 18l8 26', 'M' + (lx + 272) + ' 190l-6 -24l14 -18'].map(function (d) {
      return Pa(L.scene, d, 'none', { stroke: '#4A2A1E', 'stroke-width': 3.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 });
    });
    var patches = [[lx + 84, 278, 40, 24], [lx + 456, 206, 40, 22], [lx + 100, 512, 46, 22], [lx + 440, 514, 40, 22], [lx + 262, 170, 34, 20]].map(function (b) {
      return el('ellipse', { cx: f(b[0]), cy: f(b[1]), rx: f(b[2] / 2), ry: f(b[3] / 2), fill: '#D9D4C8' }, L.scene);
    });
    var sillL = G(L.scene); Rc(sillL, lx + 92, 500, 362, 22, 4, K.tile); Rc(sillL, lx + 92, 500, 362, 5, 3, WHITE, { opacity: 0.18 });
    var oldL = windowAt(L.scene, lx, K.creamOld, true, 5);
    var newL = windowAt(L.scene, lx, '#F7F7F4', false);
    var debris = []; (function () { var r = rng(9); for (var i = 0; i < 14; i++) debris.push({ x: lx + 120 + r() * 300, y: 200 + r() * 290, s: 6 + r() * 12, vx: (r() - 0.5) * 120, rot: r() * 360, n: Rc(L.scene, -6, -4, 12, 8, 1.5, i % 3 ? K.brickDark : K.creamOld) }); })();
    chipText(L, 'Dag 1'); chipText(L, 'Dag 2'); chipText(L, 'Dag 3'); chipText(L, '+ schilder');
    var bl = bullets(L, ['Kozijn eruit gebroken', 'Stucwerk aan de dagkanten kapot', 'Vensterbank eruit', 'Binnen schilderwerk achteraf'], 'x', K.rust);
    // ---- rechts: herstellen
    var Rp = panel(618, 'Herstellen met folie', K.mintDeep), rx = 618;
    var sillR = G(Rp.scene); Rc(sillR, rx + 92, 500, 362, 22, 4, K.tile); Rc(sillR, rx + 92, 500, 362, 5, 3, WHITE, { opacity: 0.18 });
    windowAt(Rp.scene, rx, K.creamOld, true, 5);
    var newR = windowAt(Rp.scene, rx, NEWCREAM, false);
    var clipR = new SlantClip(st, newR);
    var band = Li(Rp.scene, 0, 0, 0, 0, K.mint, 44), bandEdge = Li(Rp.scene, 0, 0, 0, 0, WHITE, 6, { opacity: 0.6 });
    var sp = Sparks(Rp.scene, [[rx + 160, 240], [rx + 400, 300], [rx + 250, 470], [rx + 420, 470], [rx + 140, 420]]);
    chipText(Rp, 'Dag 1'); var klaar = chipText(Rp, 'Klaar', WHITE);
    var br = bullets(Rp, ['Het kozijn blijft zitten', 'Alleen de folie gaat eraf', 'Klaar in een tot twee dagen', 'Binnen verandert er niets'], 'v', K.mintDeep);

    var rest = 6.4;
    function chips(P, list, t) {
      P.chipTx.forEach(function (n, i) { op(n, Math.min(seg(t, list[i], 0.25), i < list.length - 1 ? 1 - seg(t, list[i + 1] - 0.2, 0.2) : 1)); });
    }
    function render(t) {
      op(L.chip, seg(t, 0.4, 0.3)); op(Rp.chip, seg(t, 0.4, 0.3));
      chips(L, [0.4, 3.4, 4.9, 5.7], t);
      chips(Rp, [0.4, 3.2], t);
      sa(Rp.chipBg, 'fill', t >= 3.2 ? K.mintDeep : WHITE);
      // links: kozijn eruit
      var shake = seg(t, 0.8, 0.9) * (1 - seg(t, 1.6, 0.1));
      var fall = seg(t, 1.7, 0.75, E.in);
      sa(oldL, 'transform', 'translate(0 ' + f(560 * fall) + ') rotate(' + f(1.6 * Math.sin(t * 40) * shake + 16 * fall) + ' ' + (lx + 273) + ' 348)');
      op(oldL, 1 - seg(t, 2.3, 0.2));
      cracks.forEach(function (c, i) { sa(c, 'stroke-dashoffset', f(1 - seg(t, 1.0 + i * 0.12, 0.5))); op(c, 1 - seg(t, 5.0, 0.4)); });
      patches.forEach(function (p, i) { op(p, seg(t, 5.0 + i * 0.08, 0.35)); });
      debris.forEach(function (d) {
        var q = clamp((t - 1.9) / 1.1, 0, 1), on = q > 0 && q < 1;
        show(d.n, on); if (!on) return;
        sa(d.n, 'transform', 'translate(' + f(d.x + d.vx * q) + ' ' + f(d.y + 520 * q * q) + ') rotate(' + f(d.rot + 300 * q) + ') scale(' + f(d.s / 10) + ')');
      });
      var sf = seg(t, 2.8, 0.6, E.in);
      sa(sillL, 'transform', 'translate(' + f(-30 * sf) + ' ' + f(120 * sf) + ') rotate(' + f(-8 * sf) + ' ' + (lx + 273) + ' 511)'); op(sillL, 1 - seg(t, 3.2, 0.2));
      var ni = seg(t, 3.6, 0.8, E.out);
      sa(newL, 'transform', 'translate(0 ' + f(-560 * (1 - ni)) + ')'); show(newL, ni > 0);
      op(hole, 1 - seg(t, 4.2, 0.2));
      bl.forEach(function (b, i) { var q = seg(t, [1.8, 2.2, 3.0, 5.6][i], 0.4); op(b, q); sa(b, 'transform', 'translate(' + f(-14 * (1 - E.out(q))) + ' 0)'); });
      // rechts: rakel
      var wp = seg(t, 1.0, 2.0, E.inOut), xe = lerp(rx - 180, rx + 560, wp);
      if (wp <= 0) show(newR, false); else { show(newR, true); if (wp >= 1) clipR.off(); else clipR.set(xe - 200 * COT, -1); }
      var on = wp > 0 && wp < 1;
      show(band, on); show(bandEdge, on);
      if (on) {
        var xa = xe - 200 * COT;
        sa(band, 'x1', f(xa + 120 * COT + 22)); sa(band, 'y1', 120); sa(band, 'x2', f(xa + 580 * COT + 22)); sa(band, 'y2', 580);
        sa(bandEdge, 'x1', f(xa + 120 * COT - 2)); sa(bandEdge, 'y1', 120); sa(bandEdge, 'x2', f(xa + 580 * COT - 2)); sa(bandEdge, 'y2', 580);
      }
      sparks(sp, t, 3.2, 1.1);
      br.forEach(function (b, i) { var q = seg(t, [1.1, 2.0, 3.3, 4.1][i], 0.4); op(b, q); sa(b, 'transform', 'translate(' + f(-14 * (1 - E.out(q))) + ' 0)'); });
    }
    return pageScene(ps, rest, render, o);
  };

  /* ---------------------------------------------------------------- 4. AANVRAAG
   * Foto maken, aanstrepen (geel voor het kozijn, rood voor een draairaam of deur), maten erbij, versturen, vaste prijs.
   * Dezelfde stiften als het echte formulier (js/aanstrepen.js): geel #FFD400 en rood #E5212D met een donkere rand.
   */
  SC.aanvraag = function (o) {
    var ps = PageStage(o, 'Een offerte aanvragen: foto maken, aanstrepen en versturen'), st = ps.st, R = ps.root;
    var YEL = '#FFD400', RED = '#E5212D', RAND = '#1D1D1B';
    // telefoon
    var ph = G(R);
    Rc(ph, 160, 60, 380, 800, 60, '#22262A', { opacity: 0.1, transform: 'translate(0 14)' });
    Rc(ph, 160, 60, 380, 800, 60, K.ink);
    Rc(ph, 176, 76, 348, 768, 46, '#101214');
    var cid = st.id + 'scr', cp = el('clipPath', { id: cid }, st.defs); Rc(cp, 176, 76, 348, 768, 46);
    var scr = G(ph, { 'clip-path': 'url(#' + cid + ')' });
    // de foto: gevel met een crème kozijn
    var photo = G(scr);
    Rc(photo, 176, 160, 348, 500, 0, brick(st, 0.8));
    glassRect(st, photo, 218, 254, 100, 284);
    glassRect(st, photo, 344, 270, 78, 252);
    Pa(photo, frameD(200, 236, 252, 320, [[218, 254, 100, 284], [330, 254, 106, 284]], 4), K.creamOld, { 'fill-rule': 'evenodd' });
    Pa(photo, frameD(330, 254, 106, 284, [[344, 270, 78, 252]], 3), K.creamOld, { 'fill-rule': 'evenodd' });
    Rc(photo, 424, 382, 6, 26, 3, '#C9CED0');
    weather(photo, 200, 236, 252, 320, 11, 18); weather(photo, 330, 254, 106, 284, 13, 14);
    Rc(photo, 188, 556, 276, 18, 3, K.tile);
    // camera
    var cam = G(scr);
    [[196, 180, 1, 1], [504, 180, -1, 1], [196, 640, 1, -1], [504, 640, -1, -1]].forEach(function (c) {
      Pa(cam, 'M' + c[0] + ' ' + (c[1] + 30 * c[3]) + 'V' + c[1] + 'H' + (c[0] + 30 * c[2]), 'none', { stroke: WHITE, 'stroke-width': 4, 'stroke-linecap': 'round' });
    });
    Tx(cam, 'FOTO', 350, 128, 18, 700, YEL, 'middle', '0.18em');
    var shutter = G(cam); Ci(shutter, 0, 0, 38, 'none', { stroke: WHITE, 'stroke-width': 5 }); Ci(shutter, 0, 0, 29, WHITE);
    var flash = Rc(scr, 176, 76, 348, 768, 0, WHITE);
    // aanstrepen
    var mark = G(scr);
    var tip = Tx(mark, 'Streep aan wat er moet gebeuren', 350, 128, 18, 600, WHITE, 'middle');
    var pens = G(mark);
    Ci(pens, 206, 700, 12, YEL, { stroke: RAND, 'stroke-width': 2.5 }); Tx(pens, 'Kozijn', 226, 706, 17, 600, WHITE);
    Ci(pens, 312, 700, 12, RED, { stroke: RAND, 'stroke-width': 2.5 }); Tx(pens, 'Draairaam of deur', 332, 706, 17, 600, WHITE);
    var YP = [[209, 248], [209, 547], [443, 547]], RP = [[330, 254], [436, 254], [436, 538], [330, 538], [330, 254]];
    var ylwR = Pa(scr, polyD(YP), 'none', { stroke: RAND, 'stroke-width': 20, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.55, pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 });
    var redR = Pa(scr, polyD(RP), 'none', { stroke: RAND, 'stroke-width': 16, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.55, pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 });
    var ylw = Pa(scr, polyD(YP), 'none', { stroke: YEL, 'stroke-width': 15, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.88, pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 });
    var red = Pa(scr, polyD(RP), 'none', { stroke: RED, 'stroke-width': 11, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.9, pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 });
    function dim(p, x1, y1, x2, y2, s, lx, ly) {
      var g = G(p);
      Li(g, x1, y1, x2, y2, WHITE, 2.5);
      var v = x1 === x2;
      Li(g, x1 - (v ? 8 : 0), y1 - (v ? 0 : 8), x1 + (v ? 8 : 0), y1 + (v ? 0 : 8), WHITE, 2.5);
      Li(g, x2 - (v ? 8 : 0), y2 - (v ? 0 : 8), x2 + (v ? 8 : 0), y2 + (v ? 0 : 8), WHITE, 2.5);
      Rc(g, lx - 40, ly - 17, 80, 34, 17, WHITE);
      Tx(g, s, lx, ly + 7, 18, 700, K.ink, 'middle');
      return g;
    }
    var dimB = dim(scr, 200, 600, 452, 600, '1,60 m', 326, 600), dimR = dim(scr, 478, 236, 478, 556, '1,30 m', 478, 396);
    var send = G(scr); Rc(send, 222, 750, 256, 58, 29, K.mint); Tx(send, 'Versturen', 350, 787, 23, 700, K.ink, 'middle');
    var sent = G(scr); Rc(sent, 176, 76, 348, 768, 0, K.mintDeep);
    var sentOk = Badge(sent, 44, WHITE); place(sentOk, 350, 400);
    sentOk.firstChild.nextSibling.setAttribute('stroke', K.mintDeep);
    Tx(sent, 'Verstuurd', 350, 492, 30, 700, WHITE, 'middle');
    Tx(sent, 'Je hoort van ons wat het kost', 350, 530, 19, 500, '#DBECE7', 'middle');
    Rc(ph, 304, 88, 92, 26, 13, '#000000');
    // vinger
    var finger = G(R); Ci(finger, 0, 0, 30, '#22262A', { opacity: 0.22 }); Ci(finger, 0, 0, 22, 'none', { stroke: WHITE, 'stroke-width': 3.5, opacity: 0.9 });
    // vliegende foto
    var fly = G(R); Rc(fly, -64, -50, 128, 100, 14, WHITE); Rc(fly, -54, -40, 108, 80, 8, K.brick);
    Rc(fly, -30, -28, 60, 56, 3, K.creamOld); Rc(fly, -24, -22, 22, 44, 1, K.glass2); Rc(fly, 2, -22, 22, 44, 1, K.glass2);
    Li(fly, -27, 26, 27, 26, YEL, 4);
    // offerte
    var off = G(R);
    Card(off, 640, 196, 470, 500, 30);
    Tx(off, 'OFFERTE', 676, 254, 18, 600, K.mintInk, 'start', '0.22em');
    Tx(off, 'Vaste totaalprijs', 676, 302, 34, 700, K.ink);
    // Een offerte is een opsomming van het werk met één totaalprijs; voorrijden
    // staat er nooit apart in, het zit in de prijs. Vandaar "inclusief".
    var items = ['Onderdorpel en stijlen', 'Draairaam rondom', 'Inclusief voorrijden en materiaal'].map(function (s, i) {
      var g = G(off), b = Badge(g, 14, K.mintDeep); place(b, 690, 352 + i * 54);
      Tx(g, s, 716, 360 + i * 54, 22, 500, K.ink); return g;
    });
    Li(off, 676, 524, 1074, 524, LINE, 2);
    var tot = G(off);
    Tx(tot, 'Totaal', 676, 574, 26, 700, K.ink);
    Rc(tot, 916, 544, 158, 44, 22, K.ink); Tx(tot, 'Vast bedrag', 995, 573, 19, 600, WHITE, 'middle');
    Tx(tot, 'Wat hier staat, is wat je betaalt.', 676, 640, 19, 500, K.sub);
    var mon = G(R); Rc(mon, 640, 726, 470, 66, 33, WHITE);
    Rc(mon, 670, 744, 34, 30, 6, 'none', { stroke: K.mintDeep, 'stroke-width': 3 }); Li(mon, 670, 754, 704, 754, K.mintDeep, 3);
    Tx(mon, 'Offertes maken we op maandag', 722, 767, 21, 600, K.ink);

    var rest = 9.8;
    function render(t) {
      var camOn = t < 1.55;
      op(cam, 1 - seg(t, 1.3, 0.25));
      place(shutter, 350, 744, 1 - 0.14 * Math.sin(Math.PI * seg(t, 0.75, 0.3)));
      op(flash, t > 0.95 ? 0.9 * (1 - seg(t, 1.0, 0.45)) : 0);
      op(mark, Math.min(seg(t, 1.5, 0.35), 1 - seg(t, 6.05, 0.3)));
      op(pens, Math.min(seg(t, 1.6, 0.35), 1 - seg(t, 6.05, 0.3)));
      var yq = seg(t, 2.0, 1.5, E.inOut), rq = seg(t, 3.9, 1.5, E.inOut);
      sa(ylw, 'stroke-dashoffset', f(1 - yq)); sa(red, 'stroke-dashoffset', f(1 - rq));
      sa(ylwR, 'stroke-dashoffset', f(1 - yq)); sa(redR, 'stroke-dashoffset', f(1 - rq));
      op(ylw, 1 - seg(t, 7.2, 0.3)); op(red, 1 - seg(t, 7.2, 0.3));
      op(ylwR, 0.55 * (1 - seg(t, 7.2, 0.3))); op(redR, 0.55 * (1 - seg(t, 7.2, 0.3)));
      [[dimB, 5.6], [dimR, 5.85]].forEach(function (d) { op(d[0], Math.min(seg(t, d[1], 0.3), 1 - seg(t, 7.2, 0.3))); });
      op(send, Math.min(seg(t, 6.1, 0.35), 1 - seg(t, 7.2, 0.3)));
      place(send, 0, 0, 1 - 0.06 * Math.sin(Math.PI * seg(t, 6.75, 0.25)));
      op(sent, seg(t, 7.25, 0.35));
      place(sentOk, 350, 400, pop(t, 7.4, 0.45));
      // vinger: tikken, strepen, tikken
      var fp = null, fs = 1;
      if (t > 0.35 && t < 1.2) { fp = [350 + 80 * (1 - seg(t, 0.35, 0.4, E.out)), 744 + 60 * (1 - seg(t, 0.35, 0.4, E.out))]; fs = 1 - 0.15 * Math.sin(Math.PI * seg(t, 0.75, 0.3)); }
      else if (t >= 1.7 && t < 2.0) fp = [lerp(320, YP[0][0], seg(t, 1.7, 0.3, E.inOut)), lerp(700, YP[0][1], seg(t, 1.7, 0.3, E.inOut))];
      else if (t >= 2.0 && t < 3.5) fp = polyAt(YP, yq);
      else if (t >= 3.5 && t < 3.9) { var q1 = seg(t, 3.5, 0.4, E.inOut); fp = [lerp(YP[2][0], RP[0][0], q1), lerp(YP[2][1], RP[0][1], q1)]; }
      else if (t >= 3.9 && t < 5.4) fp = polyAt(RP, rq);
      else if (t >= 6.3 && t < 7.05) { var q2 = seg(t, 6.3, 0.45, E.inOut); fp = [lerp(330, 350, q2), lerp(254, 780, q2)]; fs = 1 - 0.15 * Math.sin(Math.PI * seg(t, 6.75, 0.25)); }
      if (fp) place(finger, fp[0], fp[1], fs); else show(finger, false);
      // foto vliegt naar de offerte
      var fq = seg(t, 7.1, 0.75, E.inOut);
      if (fq > 0 && fq < 1) place(fly, lerp(350, 760, fq), lerp(400, 300, fq) - 120 * Math.sin(Math.PI * fq), 1 - 0.4 * fq, -8 * Math.sin(Math.PI * fq));
      else show(fly, false);
      var oc = pop(t, 7.65, 0.5);
      place(off, 875, 446, oc); sa(off, 'transform', oc > 0.001 ? 'translate(875 446) scale(' + f(oc) + ') translate(-875 -446)' : null);
      items.forEach(function (it, i) { op(it, seg(t, 8.0 + i * 0.15, 0.3)); });
      op(tot, seg(t, 8.5, 0.35));
      var mq = seg(t, 9.0, 0.5, E.out); op(mon, seg(t, 9.0, 0.3)); sa(mon, 'transform', 'translate(0 ' + f(14 * (1 - mq)) + ')');
    }
    return pageScene(ps, rest, render, o);
  };

  /* ---------------------------------------------------------------- 5. VVE: UITVOERING IN BLOKKEN
   * Een flat met drie portieken. Per blok eerst een korte toelichting op papier voor de bewoners (zoals de
   * VvE-pagina belooft), dan gaat de hoogwerker erlangs. Met captions: false laat de scène haar eigen
   * onderschrift weg (de video's zetten er dan de ondertitels van de klusfilm onder).
   */
  SC.vve = function (o) {
    var ps = PageStage(o, 'Uitvoering in blokken bij een VvE of woningcorporatie'), st = ps.st, R = ps.root;
    var bld = G(R), BX = 90, BW = 1020, TOP = 206, GND = 724;
    Rc(R, 0, GND, 1200, 46, 0, K.walk); Rc(R, 0, GND + 46, 1200, 6, 0, '#CFCDC6');
    Rc(bld, BX, TOP, BW, GND - TOP, 0, brick(st, 0.82));
    Rc(bld, BX - 12, TOP - 18, BW + 24, 22, 4, K.roof);
    Rc(bld, BX, TOP + 4, BW, 8, 0, '#000000', { opacity: 0.1 });
    [430, 770].forEach(function (x) { Rc(bld, x - 3, TOP, 6, GND - TOP, 0, '#000000', { opacity: 0.08 }); });
    var reflClip = st.id + 'vrc', rcp = el('clipPath', { id: reflClip }, st.defs);
    var blocks = [0, 1, 2].map(function (b) {
      var x0 = BX + b * 340, panes = [], frames = [];
      for (var f2 = 0; f2 < 3; f2++) for (var c = 0; c < 2; c++) {
        var x = x0 + 34 + c * 160, y = TOP + 34 + f2 * 116, w = 126, h = 86;
        frames.push([x, y, w, h, [[x + 9, y + 9, 50, h - 18], [x + 67, y + 9, 50, h - 18]]]);
      }
      frames.push([x0 + 30, 596, 92, 72, [[x0 + 39, 605, 74, 54]]]);
      frames.push([x0 + 218, 596, 92, 72, [[x0 + 227, 605, 74, 54]]]);
      frames.push([x0 + 138, 588, 64, GND - 588, [[x0 + 148, 598, 44, 70]]]);
      frames.forEach(function (fr) { fr[4].forEach(function (q) { Rc(bld, q[0], q[1], q[2], q[3], 1.5, glassFill(st)); Rc(rcp, q[0], q[1], q[2], q[3]); }); });
      var oldG = G(bld), newG = G(bld);
      frames.forEach(function (fr, i) {
        Pa(oldG, frameD(fr[0], fr[1], fr[2], fr[3], fr[4], 3), K.creamOld, { 'fill-rule': 'evenodd' });
        if (i < 6) Rc(oldG, fr[0] + 6, fr[1] + fr[3] - 6, fr[2] * (0.3 + 0.1 * (i % 3)), 4, 2, K.glue);
        el('ellipse', { cx: f(fr[0] + fr[2] * 0.7), cy: f(fr[1] + 5), rx: f(fr[2] * 0.16), ry: 3, fill: K.creamOldDark, opacity: 0.55 }, oldG);
        Pa(newG, frameD(fr[0], fr[1], fr[2], fr[3], fr[4], 3), NEWCREAM, { 'fill-rule': 'evenodd' });
      });
      Rc(bld, x0 + 140, 650, 4, 22, 2, '#C9CED0');
      var cid = st.id + 'vb' + b, cp = el('clipPath', { id: cid }, st.defs); Rc(cp, x0, TOP, 340, GND - TOP);
      var bandG = G(bld, { 'clip-path': 'url(#' + cid + ')' });
      var band = Li(bandG, 0, 0, 0, 0, K.mint, 38), edge = Li(bandG, 0, 0, 0, 0, WHITE, 6, { opacity: 0.6 });
      // de toelichting voor de bewoners, bij de voordeur
      var env = [0, 1, 2].map(function (k) {
        var e = G(R); Rc(e, -19, -13, 38, 26, 4, WHITE, { stroke: LINE, 'stroke-width': 1.5 });
        Pa(e, 'M-17 -11L0 2L17 -11', 'none', { stroke: K.mint, 'stroke-width': 3, 'stroke-linejoin': 'round' });
        return e;
      });
      // planning
      // Alleen het blok, zonder weeknummer: hoe lang een blok duurt, beloven we niet.
      var chip = G(R), chipBg = Rc(chip, x0 + 90, 92, 160, 56, 28, WHITE, { stroke: LINE, 'stroke-width': 2 });
      var chipTx = Tx(chip, 'Blok ' + 'ABC'[b], x0 + 170, 128, 22, 600, K.ink, 'middle');
      var chipOk = Badge(chip, 15, WHITE); place(chipOk, x0 + 118, 120);
      chipOk.lastChild.setAttribute('stroke', K.mintDeep);
      return { x0: x0, newG: newG, clip: new SlantClip(st, newG), band: band, edge: edge, env: env, chip: chip, chipBg: chipBg, chipTx: chipTx, chipOk: chipOk,
        sp: Sparks(bld, [[x0 + 90, TOP + 60], [x0 + 260, TOP + 170], [x0 + 120, TOP + 290], [x0 + 250, 620]]) };
    });
    var refl = G(bld, { 'clip-path': 'url(#' + reflClip + ')' });
    for (var s = -2; s < 14; s++) {
      var x = BX + s * 92;
      Pa(refl, 'M' + f(x) + ' ' + TOP + 'l26 0l' + f((GND - TOP) * COT) + ' ' + (GND - TOP) + 'l-26 0Z', WHITE, { opacity: s % 2 ? 0.28 : 0.18 });
    }
    // hoogwerker
    var lift = G(R), scis = G(lift, { stroke: K.inkSoft, 'stroke-width': 7, 'stroke-linecap': 'round' }), arms = [];
    for (var k = 0; k < 6; k++) arms.push(Li(scis, 0, 0, 0, 0, K.inkSoft, 7));
    Rc(lift, -86, GND - 34, 172, 30, 10, K.ink);
    Ci(lift, -56, GND - 2, 13, '#22262A'); Ci(lift, 56, GND - 2, 13, '#22262A');
    var plat = G(lift);
    Rc(plat, -90, 0, 180, 16, 4, K.mint);
    Li(plat, -84, 0, -84, -50, K.mintDeep, 5); Li(plat, 84, 0, 84, -50, K.mintDeep, 5); Li(plat, -84, -50, 84, -50, K.mintDeep, 5);
    var worker = new Person(plat, { shirt: K.ink, pants: K.inkSoft, skin: K.skin, hair: 'cap', hairColor: '#17191B', logo: true });
    worker.set({ x: 22, y: 0, face: -1, s: 0.46, a: [150, 20], b: [20, 10] });
    var cap = o.captions === false ? function () {} : Caption(R, [{ t0: 0.4, t1: 3.3, text: 'Eerst een korte toelichting voor de bewoners' },
      { t0: 3.3, t1: 11.5, text: 'Daarna blok voor blok, van maart tot november' }, { t0: 11.5, text: 'Eén vaste prijs voor het hele complex' }], 600, 836, 820);

    var B0 = 0.6, BD = 3.5, rest = B0 + 3 * BD + 1.2;
    function render(t) {
      var lx = -160, h = 0, i;
      blocks.forEach(function (b, j) {
        var tb = B0 + j * BD;
        // planning
        var act = seg(t, tb + 0.1, 0.3), done = t >= tb + 3.05;
        op(b.chip, seg(t, 0.15 + j * 0.1, 0.4));
        sa(b.chipBg, 'fill', done ? K.mintDeep : (act > 0 ? K.mintSoft : WHITE)); sa(b.chipBg, 'stroke', done ? K.mintDeep : LINE);
        sa(b.chipTx, 'fill', done ? WHITE : K.ink);
        place(b.chipOk, b.x0 + 118, 120, pop(t, tb + 3.05, 0.4));
        sa(b.chipTx, 'transform', 'translate(' + f(18 * seg(t, tb + 3.05, 0.3, E.out)) + ' 0)');
        // brieven
        b.env.forEach(function (e, k2) {
          var a = pop(t, tb + k2 * 0.1, 0.4), q = seg(t, tb + 0.8, 0.35, E.in);
          place(e, b.x0 + 170 + (k2 - 1) * 34 * (1 - q), GND - 30 - 46 * (1 - q) + k2 * 0, a * (1 - q), (k2 - 1) * 10);
        });
        // rakel over het blok
        var wp = seg(t, tb + 1.6, 1.4, E.inOut), xe = lerp(b.x0 - 140 - 230 * COT, b.x0 + 360 - 230 * COT, wp);
        if (wp <= 0) show(b.newG, false); else { show(b.newG, true); if (wp >= 1) b.clip.off(); else b.clip.set(xe, -1); }
        var on = wp > 0 && wp < 1;
        show(b.band, on); show(b.edge, on);
        if (on) {
          sa(b.band, 'x1', f(xe + TOP * COT + 20)); sa(b.band, 'y1', TOP); sa(b.band, 'x2', f(xe + GND * COT + 20)); sa(b.band, 'y2', GND);
          sa(b.edge, 'x1', f(xe + TOP * COT - 2)); sa(b.edge, 'y1', TOP); sa(b.edge, 'x2', f(xe + GND * COT - 2)); sa(b.edge, 'y2', GND);
        }
        sparks(b.sp, t, tb + 3.0, 1.0, 0.9);
        // hoogwerker: naar het blok (na de brieven), omhoog, omlaag
        if (t >= tb + 0.55) lx = lerp(j ? blocks[j - 1].x0 + 170 : -160, b.x0 + 170, seg(t, tb + 0.55, j ? 0.7 : 0.9, E.inOut));
        if (t >= tb + 1.15) h = Math.min(seg(t, tb + 1.15, 0.5, E.inOut), 1 - seg(t, tb + 3.05, 0.4, E.inOut));
      });
      if (t > B0 + 3 * BD - 0.1) lx = lerp(blocks[2].x0 + 170, 1320, seg(t, B0 + 3 * BD - 0.1, 1.0, E.in));
      var py = lerp(GND - 52, 400, h), n = arms.length / 2, hs = (GND - 34 - (py + 16)) / n;
      for (i = 0; i < n; i++) {
        var ya = GND - 34 - i * hs, yb = ya - hs;
        sa(arms[2 * i], 'x1', -64); sa(arms[2 * i], 'y1', f(ya)); sa(arms[2 * i], 'x2', 64); sa(arms[2 * i], 'y2', f(yb));
        sa(arms[2 * i + 1], 'x1', 64); sa(arms[2 * i + 1], 'y1', f(ya)); sa(arms[2 * i + 1], 'x2', -64); sa(arms[2 * i + 1], 'y2', f(yb));
      }
      sa(plat, 'transform', 'translate(0 ' + f(py) + ')');
      place(lift, lx, 0, 1);
      worker.set({ x: 22, y: 0, face: -1, s: 0.46, a: h > 0.9 ? [150 + 10 * Math.sin(t * 6), 20] : [6, 10], b: [10, 10] });
      cap(t);
    }
    return pageScene(ps, rest, render, o);
  };

  /* ================================================================ speler */

  function create(name, o) {
    if (!SC[name]) throw new Error('iWrapMotion: onbekende animatie "' + name + '"');
    var sc = SC[name](o || {});
    sc.name = name;
    return sc;
  }

  function mount(target, name, o) {
    o = o || {};
    var host = typeof target === 'string' ? document.querySelector(target) : target;
    if (!host) throw new Error('iWrapMotion: element niet gevonden');
    var sc = create(name, o);
    host.appendChild(sc.svg);
    var mode = o.play || (sc.endless ? 'loop' : (sc.interactive ? 'hover' : 'once'));
    var p = { scene: sc, t: 0, playing: false, speed: o.rate || 1, mode: mode, el: host }, raf = 0, last = 0, started = false;
    var reduce = !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches) && !o.force;

    function frame(now) {
      raf = 0;
      if (!p.playing) return;
      var dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      p.t += dt * p.speed;
      if (sc.endless) {
        if (p.t > sc.introDur + sc.loopDur * 4) p.t -= sc.loopDur * 3;
      } else {
        var e = mode === 'loop' ? sc.duration : sc.rest;
        if (p.t >= e) {
          if (mode === 'loop') p.t = p.t % e;
          else { p.t = e; p.playing = false; }
        }
      }
      sc.render(p.t);
      if (p.onframe) p.onframe(p.t);
      if (p.playing) raf = root.requestAnimationFrame(frame);
    }
    p.play = function () {
      if (p.playing) return p;
      p.playing = true; last = root.performance.now();
      raf = root.requestAnimationFrame(frame);
      return p;
    };
    p.pause = function () { p.playing = false; if (raf) root.cancelAnimationFrame(raf); raf = 0; return p; };
    p.seek = function (t) { p.t = t; sc.render(t); return p; };
    p.replay = function () { p.t = 0; sc.render(0); return p.play(); };
    p.destroy = function () { p.pause(); if (io) io.disconnect(); if (sc.svg.parentNode) sc.svg.parentNode.removeChild(sc.svg); };

    if (sc.replayBtn) {
      var rb = function (e) { if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return; if (e.preventDefault) e.preventDefault(); p.replay(); };
      sc.replayBtn.addEventListener('click', rb); sc.replayBtn.addEventListener('keydown', rb);
    }
    var io = null;
    if (reduce) {
      p.t = sc.posterT != null ? sc.posterT : (sc.endless ? sc.introDur : sc.rest);
      sc.render(p.t);                                                // rustig eindbeeld, geen beweging
    } else if (mode === 'hover') {
      sc.render(sc.rest);
      host.addEventListener('pointerenter', function () { p.replay(); });
      host.addEventListener('focus', function () { p.replay(); }, true);
    } else if (mode === 'manual') {
      p.t = o.at != null ? o.at : sc.rest;
      sc.render(p.t);
    } else {
      // start: 'rest' = eerste beeld is het complete logo (handig voor miniaturen), daarna loopt de lus door
      if (o.start === 'rest') p.t = sc.endless ? sc.introDur : sc.rest;
      sc.render(p.t);
      if ('IntersectionObserver' in root) {
        io = new IntersectionObserver(function (es) {
          es.forEach(function (en) {
            if (en.isIntersecting) { if (!started || mode === 'loop') { started = true; p.play(); } }
            else if (mode === 'loop' || sc.endless) p.pause();
          });
        }, { threshold: 0.25 });
        io.observe(host);
      } else p.play();
    }
    return p;
  }

  function auto() {
    var nodes = document.querySelectorAll('[data-iwrap]');
    Array.prototype.forEach.call(nodes, function (n) {
      if (n.__iwrap) return;
      var o = {}, d = n.dataset, k;
      for (k in d) {
        if (k === 'iwrap') continue;
        var v = d[k];
        o[k] = v === 'true' ? true : v === 'false' ? false : (v !== '' && !isNaN(v) ? +v : v);
      }
      n.__iwrap = mount(n, d.iwrap, o);
    });
  }

  var api = { version: '1.0.0', mount: mount, create: create, scenes: SC, auto: auto, geo: GEO, colors: C, themes: THEMES, ease: E, angle: THETA * 180 / Math.PI };
  root.iWrapMotion = api;
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', auto);
    else auto();
  }
})(typeof window !== 'undefined' ? window : this);
